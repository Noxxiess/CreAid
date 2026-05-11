import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/newpatient.css";
import { supabase } from "../lib/supabase";

function NewPatient() 
{   
  const [step, setStep] = useState(0);
  const steps = ["Personal", "Guardian", "Medical"];
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const [personal, setPersonal] = useState({
    lastname: "",
    firstname: "",
    middlename: "",
  });
  const handleSubmit = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          first_name: personal.firstname,
          middle_name: personal.middlename,
          last_name: personal.lastname,
          email: personal.email,
          contact_number: personal.mobile,
          address: personal.address,
          role: "patient",

          // temporary testing password
          password: "default123"
        }
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      alert(error.message);
      return;
    }

    console.log("Inserted:", data);

    alert("Patient successfully added!");

    // OPTIONAL: clear form
    setPersonal({
      lastname: "",
      firstname: "",
      middlename: "",
      suffix: "",
      nickname: "",
      birthdate: "",
      sex: "",
      mobile: "",
      email: "",
      address: "",
      school: "",
      hmo: "",
      referredBy: "",
      bloodType: "",
      weight: "",
      height: "",
      civilStatus: "",
      occupation: "",
      company: "",
    });

  } catch (err) {
  console.error("Full error:", err);
  alert(err.message);
}
};

  const [guardian, setGuardian] = useState
  ({
    fatherName: "",
    fatherOccupation: "",
    fatherEmployer: "",
    fatherContact: "",
    motherName: "",
    motherOccupation: "",
    motherEmployer: "",
    motherContact: "",
    guardianName: "",
    guardianContact: "",
    physicianName: "",
    physicianContact: "",
  });

  const [medical, setMedical] = useState
  ({
    previousHospitalizations: "",
    prescribedMedications: "",
    allergies: "",
    familyMedicalProblems: "",
    otherMedicalConcerns: "",
    medicalAlert: "",
    conditions: [],
  });

  const handleChange = (e) => 
  {
    setPersonal({ ...personal, [e.target.name]: e.target.value });
  };
  
  const handleGuardianChange = (e) => 
  {
    setGuardian({ ...guardian, [e.target.name]: e.target.value });
  };

  const handleMedicalChange = (e) => 
  {
    setMedical({...medical, [e.target.name]: e.target.value, });
  };

  const medicalConditions = 
  [
    "kidney problems",
    "testing",
    "learning disability",
    "tuberculosis",
    "bleeding disorder",
    "brain injury",
    "tumors",
    "neurological disorder",
    "ear infection",
    "skin disorder",
    "glandular problems",
    "heart trouble",
    "diabetes",
    "mental disorder",
    "asthma",
    "rheumatic fever",
    "liver problems",
    "hyperactivity",
    "seizures",
    "mental retardation",
  ];

  
  const dentalHabits = 
  [
    "night time bottle feeding",
    "thumb sucking",
    "tongue thrusting",
    "teeth grinding",
    "nail biting",
    "mouth breathing",
  ];

  const toggleCondition = (condition) => 
  {
    setMedical((prev) => ({...prev, conditions: prev.conditions.includes(condition) ? prev.conditions.filter((c) => c !== condition) : [...prev.conditions, condition],}));
  };

  /* ================= CAMERA ================= */
  useEffect(() => 
  {
    if (showCamera) 
    {
      navigator.mediaDevices .getUserMedia({ video: true })
        .then((stream) => 
        {
          const video = document.getElementById("video");
          if (video) video.srcObject = stream;
        })
        .catch(() => 
        {
          alert("Camera access denied");
          setShowCamera(false);
        });
    }
  }, [showCamera]);

  const stopCamera = () => 
  {
    const video = document.getElementById("video");

    if (video && video.srcObject) 
    {
      video.srcObject.getTracks().forEach((t) => t.stop());
    }
  };

  const capturePhoto = () => 
  {
    const video = document.getElementById("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/png"));
    stopCamera();
    setShowCamera(false);
  };

  return (
    <div className="admin-container">
      <Sidebar />
      
      <div className="admin-main">
        <Topbar />

        <div className="dashboard-content">
          <h2 className="page-title">New Patient Information</h2>

          <div className="new-patient-container">

            {/* ================= STEPPER ================= */}
            <div className="stepper">
              {steps.map((label, index) => (
                <div key={index} className={`step ${step === index ? "active" : ""}`}>
                  <div className="circle">{label[0]}</div>
                  <span>{label.toUpperCase()}</span>
                </div>
              ))}
            </div>

            <div className="form-content">

              {/* ================= PERSONAL STEP ================= */}
              {step === 0 && 
              (
                <>
                  <p className="form-note">
                    Please fill in all required information.
                  </p>

                  <div className="personal-form">
                    {/* PHOTO */}
                    <div className="photo-column">
                      <div className="photo-actions">
                        <button onClick={() => document.getElementById("photoUpload").click()}>
                          Upload
                        </button>
                        <button onClick={() => setShowCamera(true)}>
                          Capture
                        </button>
                      </div>

                      <input id="photoUpload" type="file" accept="image/*" hidden
                        onChange=
                        {
                          (e) =>
                          e.target.files[0] &&
                          setPhoto(URL.createObjectURL(e.target.files[0]))
                        }
                      />

                      <div className="photo-box">
                      {
                        photo ? 
                        (
                          <img src={photo} alt="Patient" className="photo-preview" />
                        ) : 
                        (
                          "No Photo"
                        )
                      }
                      </div>
                    </div>

                    {/* FORM FIELDS */}
                    <div className="form-fields">
                      <div className="form-row five">
                        <div>
                          <label>Lastname</label>
                          <input name="lastname" placeholder="Lastname *" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Firstname</label>
                          <input name="firstname" placeholder="Firstname *" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Middlename</label>
                          <input name="middlename" placeholder="Middlename" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Suffix</label>
                          <input name="suffix" placeholder="Suffix" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Nickname</label>
                          <input name="nickname" placeholder="Nickname" onChange={handleChange} />
                        </div>
                      </div>

                      <div className="form-row four">
                        <div>
                          <label>Birthdate</label>
                          <input type="date" name="birthdate" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Sex</label>
                          <select name="sex" onChange={handleChange}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label>Contact No.</label>
                          <input name="mobile" placeholder="Contact Number" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Email</label>
                          <input name="email" placeholder="Email" onChange={handleChange} />
                        </div>
                      </div>

                      <div className="form-row two">
                        <div>
                          <label>Address</label>
                          <input name="address" placeholder="Address" onChange={handleChange} />
                        </div>
                        <div>
                          <label>School</label>
                          <input name="school" placeholder="School" onChange={handleChange} />
                        </div>
                      </div>

                      <div className="form-row five">
                        <div>
                          <label>Blood Type</label>
                          <input name="bloodType" placeholder="Blood Type" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Weight</label>
                          <input name="weight" placeholder="Weight" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Height</label>
                          <input name="height" placeholder="Height" onChange={handleChange} />
                        </div>
                      </div>

                      <div className="form-row three">
                        <div>
                          <label>Civil Status</label>
                          <select name="civilStatus" onChange={handleChange}>
                            <option>Single</option>
                            <option>Married</option>
                            <option>Widowed</option>
                          </select>
                          </div>
                        <div>
                          <label>Occupation</label>
                          <input name="occupation" placeholder="Occupation" onChange={handleChange} />
                        </div>
                        <div>
                          <label>Company</label>
                          <input name="company" placeholder="Company" onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-cancel">Cancel</button>
                    <button className="btn-next" onClick={() => setStep(1)}>
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* ================= GUARDIAN STEP ================= */}
              {step === 1 && 
              (
                <>
                  <p className="form-note">
                    Please fill in your parent or guardian information.
                  </p>

                  <div className="guardian-form">
                    <div className="form-row four">
                      <div>
                        <label>Father's Name </label>
                        <input name="fatherName" placeholder="Father's Name" onChange={handleGuardianChange} />
                      </div>
                      <div>
                        <label>Occupation</label>
                        <input name="fatherOccupation" placeholder="Occupation" onChange={handleGuardianChange} />
                      </div>
                      <div>
                        <label>Contact No.</label>
                      <input name="fatherContact" placeholder="Contact Number" onChange={handleGuardianChange} />
                      </div>
                    </div>

                    <div className="form-row four">
                      <div>
                        <label>Mother's Name </label>
                        <input name="motherName" placeholder="Mother's Name" onChange={handleGuardianChange} />
                      </div>
                      <div>
                        <label>Occupation</label>
                        <input name="motherOccupation" placeholder="Occupation" onChange={handleGuardianChange} />
                      </div>
                      <div>
                        <label>Contact No.</label>
                        <input name="motherContact" placeholder="Contact Number" onChange={handleGuardianChange} />
                      </div>
                    </div>

                    <div className="form-row four">
                      <div>
                        <label>Guardian's Name</label>
                        <input name="guardianName" placeholder="Guardian's Name" onChange={handleGuardianChange} />
                      </div>
                      <div>
                        <label>Occupation</label>
                        <input name="guardianOccupation" placeholder="Occupation" onChange={handleGuardianChange} />                      </div>
                      <div>
                        <label>Contact No.</label>
                        <input name="guardianContact" placeholder="Guardian's Contact" onChange={handleGuardianChange} />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-cancel" onClick={() => setStep(0)}>
                      ← Previous
                    </button>
                    <button className="btn-next" onClick={() => setStep(2)}>
                      Next →
                    </button>
                  </div>
                </>
              )}

              {/* ================= MEDICAL + DENTAL STEP ================= */}
              {step === 2 && 
              (
                <>
                  <p className="form-note">
                    Please provide your medical information.
                  </p>

                  <div className="medical-form">

                    {/* LEFT COLUMN */}
                    <div className="medical-left">
                      <div>
                        <label>Previous Hospitalizations</label>
                        <input
                          name="previousHospitalizations"
                          value={medical.previousHospitalizations}
                          onChange={handleMedicalChange}
                        />
                      </div>
                      <div>
                        <label>Prescribed Medications</label>
                        <input name="prescribedMedications" value={medical.prescribedMedications} onChange={handleMedicalChange}/>
                      </div>

                      <div>
                        <label>Allergies to Medications</label>
                        <input name="allergies" value={medical.allergies} onChange={handleMedicalChange}/>
                      </div>

                      <div>
                        <label>Family Medical Problems</label>
                        <input name="familyMedicalProblems" value={medical.familyMedicalProblems} onChange={handleMedicalChange}/>
                      </div>

                      <div>
                        <label>Other Medical Concerns</label>
                        <input name="otherMedicalConcerns" value={medical.otherMedicalConcerns} onChange={handleMedicalChange}/>
                      </div>
                    </div>
        
                    {/* RIGHT COLUMN */}
                    <div className="medical-right">

                        <div>
                          <label>Medical Alert</label>
                          <input name="medicalAlert" value={medical.medicalAlert} onChange={handleMedicalChange}/>
                        </div>

                      <div className="conditions">
                        <label>Medical Conditions</label>
                        <div className="conditions-grid">
                          {medicalConditions.map((condition) => 
                          (
                            <label key={condition} className="condition-item">
                              <input type="checkbox" checked={medical.conditions.includes(condition)} onChange={() => toggleCondition(condition)}/>
                              {condition}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="conditions">
                        <label>Dental Habits</label>
                        <div className="conditions-grid">
                          {dentalHabits.map((habit) => 
                          (
                            <label key={habit} className="condition-item">
                              <input type="checkbox" checked={medical.habits?.includes(habit)}
                                onChange=
                                {() =>
                                  setMedical((prev) => 
                                  ({
                                    ...prev, habits: prev.habits?.includes(habit) ? prev.habits.filter((h) => h !== habit) : [...(prev.habits || []), habit],
                                  }))
                                }
                              />
                              {habit}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label>Patient's Diet</label>
                        <input name="patientDiet" value={medical.patientDiet || ""} onChange={handleMedicalChange}/>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn-cancel" onClick={() => setStep(1)}>
                      ← Previous
                    </button>
                    <button className="btn-next"  onClick={handleSubmit}>
                      Finish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CAMERA MODAL ================= */}
      {showCamera && 
      (
        <div className="camera-modal">
          <div className="camera-container">
            <video id="video" autoPlay />
            <div className="camera-actions">
              <button className="btn-capture" onClick={capturePhoto}>
                Capture
              </button>
              <button className="btn-cancel" onClick={() => {stopCamera(); setShowCamera(false);}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewPatient;