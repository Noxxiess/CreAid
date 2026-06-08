import { Elysia } from "elysia";
import { supabase } from "../supabase.js";

async function recalculateAppointmentTotals(
  appointmentId
)
{
  const {
    data: services
  } =
  await supabase
    .from("appointment_services")
    .select("price")
    .eq(
      "appointment_id",
      appointmentId
    )
    .eq(
      "service_status",
      "performed"
    );

  const total =
    services.reduce(
      (sum, s) =>
        sum + Number(s.price),
      0
    );

  const {
    data: appointment
  } =
  await supabase
    .from("appointments")
    .select("amount_paid")
    .eq(
      "id",
      appointmentId
    )
    .single();

  const remaining =
    Math.max(
      0,
      total -
      Number(
        appointment.amount_paid || 0
      )
    );

  await supabase
    .from("appointments")
    .update({
      total_amount: total,
      remaining_balance:
        remaining
    })
    .eq(
      "id",
      appointmentId
    );
}

export const appointmentRoutes =
new Elysia({
  prefix: "/appointments"
})

.post("/",
async ({ body, set }) => {

  console.log(
  "BODY RECEIVED:",
  body
);

  const {
    patient_id,

    guest_name,
    guest_contact,
    guest_email,

    dentist_id,

    selected_services,

    appointment_date,
    appointment_time,
    appointment_end_time,

    receipt_url,
    cancellation_deadline,

    payment_method,
    payment_status,
    status,

    total_amount,
    downpayment_amount,

    notes,
    reason_for_visit
  } = body;

  const cancellation_token =
  crypto.randomUUID();

  if (
    !patient_id &&
    !guest_name
  ) {
    set.status = 400;

    return {
      success: false,
      message:
        "Patient information required"
    };
  }

  console.log(
  "STATUS RECEIVED:",
  status
);

  const {
    data: appointment,
    error: appointmentError
  } =
    await supabase
      .from("appointments")
      .insert([
        {
          patient_id,

          guest_name,
          guest_contact,
          guest_email,

          dentist_id,

          appointment_date,
          appointment_time,
          appointment_end_time,
          
          receipt_url,
          cancellation_deadline,
          cancellation_token,

          payment_method,
          payment_status,
          status,

          total_amount,
          downpayment_amount,

          amount_paid: 0,

          remaining_balance: total_amount,

          notes,
          reason_for_visit
          
        }
      ])
      .select()
      .single();

      console.log(
  "APPOINTMENT ERROR:",
  appointmentError
);

  if (appointmentError) {

    set.status = 500;

    return {
      success: false,
      message:
        appointmentError.message
    };
  }

  if (
    selected_services?.length
  ) {

    const servicesPayload =
      selected_services.map(
        (service) => ({
          appointment_id:
            appointment.id,

          service_id:
            service.id,

          service_name:
            service.name,

          price:
            service.price,

          duration_minutes:
            service.duration_minutes
        })
      );

    const {
      error:
        servicesError
    } =
      await supabase
        .from(
          "appointment_services"
        )
        .insert(
          servicesPayload
        );

    if (servicesError) {

      set.status = 500;

      return {
        success: false,
        message:
          servicesError.message
      };
    }

  }

  const cancelLink =
`${process.env.FRONTEND_URL}/cancel/${cancellation_token}`;

try {

  await sendAppointmentEmail({

    to: guest_email,

    name:
      guest_name ||
      "Patient",

    dentist:
      dentist_id,

    date:
      appointment_date,

    time:
      appointment_time,

    totalAmount:
      total_amount,

    downpayment:
      downpayment_amount,

    cancelLink

  });

  console.log(
    "Appointment email sent."
  );

}
catch(emailError)
{
  console.error(
    "EMAIL ERROR:",
    emailError
  );
}

  return {
    success: true,
    message:
      "Appointment booked successfully"
  };
})


.get("/payments",
async ({ set }) => {

  const { data, error } =
  await supabase
    .from("appointments")
    .select(`
      id,
      guest_name,
      total_amount,
      amount_paid,
      remaining_balance,
      payment_method,
      payment_status,
      appointment_date
    `)
    .gt("total_amount", 0)
    .not("guest_name", "is", null)
    .order(
      "created_at",
      {
        ascending: false
      }
    );

    console.log(
  "PAYMENTS:",
  data
);

console.log(
  "ERROR:",
  error
);

  return {
    success: true,
    payments: data
  };

})

.get("/",
async ({ set }) => {

  const { data, error } =
    await supabase
      .from("appointments")
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(
          id,
          full_name,
          contact_number
        ),
        dentist:users!appointments_dentist_id_fkey(
          id,
          full_name
        ),
        service:services(
          id,
          name,
          price
        )
      `)
      .order("created_at", {
        ascending: false
      });

  if (error) {

    set.status = 500;

    return {
      success: false,
      message: error.message
    };
  }

  return {
    success: true,
    appointments: data || []
  };
})

.get("/stats",
async ({ set }) => {

  const { data, error } =
    await supabase
      .from("appointments")
      .select(`
      status,
      payment_status,
      total_amount,
      downpayment_amount
`)

  if (error) {

    set.status = 500;

    return {
      success: false,
      message: error.message
    };
  }
  const pendingVerification =
  data.filter(
    a =>
      a.status ===
      "pending_verification"
  ).length;

  const totalAppointments =
    data.length;

  const scheduled =
    data.filter(
      a =>
        a.status ===
        "scheduled"
    ).length;

  const completed =
    data.filter(
      a =>
        a.status ===
        "completed"
    ).length;

  const cancelled =
    data.filter(
      a =>
        a.status ===
        "cancelled"
    ).length;

  const noShow =
    data.filter(
      a =>
        a.status ===
        "no_show"
    ).length;

  const revenue =
data.reduce(
  (sum, a) =>
  {
    if(
      a.payment_status ===
      "paid"
    )
    {
      return (
        sum +
        Number(
          a.total_amount || 0
        )
      );
    }

    if(
      a.status ===
      "cancelled" ||
      a.status ===
      "no_show"
    )
    {
      return (
        sum +
        Number(
          a.downpayment_amount || 0
        )
      );
    }

    return sum;
  },
  0
);

  return {
    success: true,

    stats: {
  totalAppointments,
  scheduled,
  completed,
  cancelled,
  noShow,
  pendingVerification,
  revenue
}
  };

})

.get("/treatment-stats",
async ({ set }) => {

  const { data, error } =
    await supabase
      .from("appointment_services")
.select("service_name")
.eq(
  "service_status",
  "performed"
);

  if (error) {
    set.status = 500;

    return {
      success: false,
      message: error.message
    };
  }

  const counts = {};

  data.forEach(item => {
    const name =
      item.service_name || "Unknown";

    counts[name] =
      (counts[name] || 0) + 1;
  });

  const treatments =
    Object.entries(counts).map(
      ([name, count]) => ({
        name,
        count
      })
    );

  return {
    success: true,
    treatments
  };
})

.get("/balances",
async ({ set }) => {

  const { data, error } =
    await supabase
      .from("appointments")
      .select(`
        id,
        guest_name,
        total_amount,
        amount_paid,
        remaining_balance,
        payment_method,
        payment_status,
        status
      `)
      .gt(
        "remaining_balance",
        0
      )
      .or(
  "status.eq.scheduled,status.eq.completed"
)

      console.log(
  "BALANCES:",
  data
);

console.log(
  "BALANCE ERROR:",
  error
);

  return {
    success: true,
    patients: data
  };
})

.get("/:id/services",
async ({ params, set }) => {

  const { data, error } =
    await supabase
      .from(
        "appointment_services"
      )
      .select(`
  id,
  service_name,
  price,
  duration_minutes,
  service_status
`)
      .eq(
        "appointment_id",
        params.id
      );

  if(error)
  {
    set.status = 500;

    return {
      success: false,
      message:
        error.message
    };
  }

  return {
    success: true,
    services: data
  };
})

.get("/services",
async () => {

  const { data, error } =
    await supabase
      .from("services")
      .select("*")
      .order("name");

  return {
    success: !error,
    services: data || []
  };
})

.patch("/:id/mark-paid",
async ({ params, set }) => {

  const {
    data: appointment,
    error: fetchError
  } =
    await supabase
      .from("appointments")
      .select(`
        total_amount
      `)
      .eq("id", params.id)
      .single();

  if(fetchError)
  {
    set.status = 500;

    return {
      success: false,
      message:
        fetchError.message
    };
  }

  const { error } =
    await supabase
      .from("appointments")
      .update({
        payment_status: "paid",
        amount_paid:
          appointment.total_amount,
        remaining_balance: 0
      })
      .eq("id", params.id);

  if(error)
  {
    set.status = 500;

    return {
      success: false,
      message:
        error.message
    };
  }

  return {
    success: true
  };
})

.patch("/:id/undo-paid",
async ({ params }) => {

  await recalculateAppointmentTotals(
    params.id
  );

  const {
    data: appointment
  } =
    await supabase
      .from("appointments")
      .select(`
        total_amount,
        downpayment_amount
      `)
      .eq("id", params.id)
      .single();

  await supabase
    .from("appointments")
    .update({
      payment_status:
        "downpayment_paid",

      amount_paid:
        appointment.downpayment_amount,

      remaining_balance:
        Math.max(
          0,
          appointment.total_amount -
          appointment.downpayment_amount
        )
    })
    .eq("id", params.id);

  return {
    success: true
  };
})

.patch("/:id/cancel-payment",
async ({ params }) => {

  const { error } =
    await supabase
      .from("appointments")
      .update({
        payment_status:
          "cancelled",

        status:
          "cancelled"
      })
      .eq("id", params.id);

  return {
    success: !error
  };
})

.patch("/:id/reinstate-payment",
async ({ params }) => {

  const { error } =
    await supabase
      .from("appointments")
      .update({
        payment_status:
          "downpayment_paid",

        status:
          "scheduled"
      })
      .eq("id", params.id);

  return {
    success: !error
  };
})

.patch("/:id/confirm-downpayment",
async ({ params, set }) => {

   console.log(
    "CONFIRMING:",
    params.id
  );

  const {
    data: appointment,
    error: fetchError
  } =
    await supabase
      .from("appointments")
      .select(`
        total_amount,
        downpayment_amount
      `)
      .eq("id", params.id)
      .single();

       console.log(
    "APPOINTMENT:",
    appointment
  );

  console.log(
    "FETCH ERROR:",
    fetchError
  );

  if(fetchError)
  {
    set.status = 500;

    return {
      success: false,
      message:
        fetchError.message
    };
  }

  const {
  data,
  error
} =
await supabase
  .from("appointments")
  .update({
    payment_status: "downpayment_paid",
    status: "scheduled",
    amount_paid:
      appointment.downpayment_amount,
    remaining_balance:
      appointment.total_amount -
      appointment.downpayment_amount
  })
  .eq("id", params.id)
  .select();

console.log(
  "UPDATE DATA:",
  data
);

console.log(
  "UPDATE ERROR:",
  error
);

  if(error)
  {
    set.status = 500;

    return {
      success: false,
      message:
        error.message
    };
  }

  return {
    success: true
  };
})

.patch("/:id/status",
async ({ params, body, set }) => {

  const { status } = body;

  const { error } =
    await supabase
      .from("appointments")
      .update({ status })
      .eq("id", params.id);

  if (error) {

    set.status = 500;

    return {
      success: false,
      message: error.message
    };
  }

  return {
    success: true,
    message: "Appointment status updated"
  };
})

.post("/:id/add-service",
async ({ params, body, set }) => {

  const { service_id } = body;

  const {
    data: existing
  } =
  await supabase
    .from("appointment_services")
    .select("*")
    .eq("appointment_id", params.id)
    .eq("service_id", service_id)
    .maybeSingle();

  if(existing)
  {
    if(existing.service_status === "not_performed")
    {
      await supabase
        .from("appointment_services")
        .update({
          service_status: "performed"
        })
        .eq("id", existing.id);

      await recalculateAppointmentTotals(params.id);

      return {
        success: true,
        message: "Service restored"
      };
    }

    return {
      success: false,
      message: "Service already added"
    };
  }

  const {
    data: service,
    error: serviceError
  } =
  await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();

  if(serviceError)
  {
    set.status = 500;

    return {
      success: false,
      message: serviceError.message
    };
  }

  const {
    error: insertError
  } =
  await supabase
    .from("appointment_services")
    .insert([
      {
        appointment_id: params.id,
        service_id: service.id,
        service_name: service.name,
        price: service.price,
        duration_minutes: service.duration_minutes,
        service_status: "performed"
      }
    ]);

  if(insertError)
  {
    set.status = 500;

    return {
      success: false,
      message: insertError.message
    };
  }

  await recalculateAppointmentTotals(params.id);

  return {
    success: true
  };
})

.patch(
"/services/:serviceRecordId/not-performed",
async ({ params }) => {

  const {
    data: service
  } =
  await supabase
    .from("appointment_services")
    .select("*")
    .eq(
      "id",
      params.serviceRecordId
    )
    .single();

  if(
    service.service_status ===
    "not_performed"
  )
  {
    return {
      success: false
    };
  }

  await supabase
    .from("appointment_services")
    .update({
      service_status:
        "not_performed"
    })
    .eq(
      "id",
      params.serviceRecordId
    );

  await recalculateAppointmentTotals(
    service.appointment_id
  );

  return {
    success: true
  };
})

.patch(
"/services/:serviceRecordId/performed",
async ({ params }) => {

  const {
    data: service
  } =
  await supabase
    .from("appointment_services")
    .select("*")
    .eq(
      "id",
      params.serviceRecordId
    )
    .single();

  if(
    service.service_status ===
    "performed"
  )
  {
    return {
      success: false,
      message:
        "Already performed"
    };
  }

  await supabase
    .from("appointment_services")
    .update({
      service_status:
        "performed"
    })
    .eq(
      "id",
      params.serviceRecordId
    );

  await recalculateAppointmentTotals(
    service.appointment_id
  );

  return {
    success: true
  };
});

