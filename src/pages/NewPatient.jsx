import { useState, useEffect } from "react";
import "../styles/newpatient.css";
import { supabase } from "../lib/supabase";

const PERSONAL_REQUIRED = [
  { name: "lastname",     label: "Last Name" },
  { name: "firstname",   label: "First Name" },
  { name: "birthdate",   label: "Birthdate" },
  { name: "sex",         label: "Sex" },
  { name: "mobile",      label: "Mobile No." },
  { name: "homeAddress", label: "Home Address" },
  { name: "nationality", label: "Nationality" },
  { name: "religion",    label: "Religion" },
  { name: "civilStatus", label: "Civil Status" },
  { name: "occupation",  label: "Occupation" },
  { name: "email",       label: "Email" },
];

const GUARDIAN_REQUIRED = [
  { name: "fatherName",    label: "Father's Name" },
  { name: "motherName",    label: "Mother's Name" },
  { name: "physicianName", label: "Physician's Name" },
];

const MEDICAL_REQUIRED = [
  { name: "lastDentalVisit", label: "Last Dental Visit" },
  { name: "goodHealth",      label: "Question 1 (Good Health)" },
  { name: "bleedingTime",    label: "Bleeding Time" },
];

const MEDICAL_CONDITIONS = [
  "High Blood Pressure", "Low Blood Pressure", "Epilepsy / Convulsions",
  "AIDS / HIV Infection", "Sexually Transmitted Diseases",
  "Stomach Troubles / Ulcers", "Fainting Seizure", "Rapid Weight Loss",
  "Radiation Therapy", "Joint Replacement / Implant", "Sinus Surgery",
  "Heart Attack", "Thyroid Problem", "Heart Disease", "Heart Murmur",
  "Hepatitis / Liver Disease", "Rheumatic Fever", "Hay Fever / Allergies",
  "Respiratory Problems", "Tuberculosis", "Kidney Disease", "Diabetes",
  "Chest Pain", "Stroke", "Cancer / Tumors", "Anemia", "Angina",
  "Emphysema", "Bleeding Problems", "Head Disease", "Head Injuries",
  "Learning Disability", "Bleeding Disorder", "Brain Injury",
  "Neurological Disorder", "Ear Infection", "Skin Disorder",
  "Glandular Problems", "Mental Disorder", "Asthma", "Liver Problems",
  "Hyperactivity", "Seizures",
];

const DENTAL_HABITS = [
  "Night Time Bottle Feeding", "Thumb Sucking", "Tongue Thrusting",
  "Teeth Grinding", "Nail Biting", "Mouth Breathing",
];

const EMPTY_PERSONAL = 
{
  lastname: "", firstname: "", middlename: "", suffix: "", nickname: "",
  birthdate: "", age: "", sex: "", religion: "", nationality: "",
  mobile: "", email: "", officeNo: "", faxNo: "", homeNo: "",
  homeAddress: "", school: "", hmo: "", referredBy: "", referralReason: "",
  bloodType: "", bloodPressure: "", weight: "", height: "",
  civilStatus: "", occupation: "", company: "",
  guardianNameMinor: "", guardianOccupationMinor: "",
};

const EMPTY_GUARDIAN = 
{
  fatherName: "", fatherOccupation: "", fatherEmployer: "", fatherContact: "",
  motherName: "", motherOccupation: "", motherEmployer: "", motherContact: "",
  guardianName: "", guardianOccupation: "", guardianContact: "",
  physicianName: "", physicianSpecialty: "",
  physicianOfficeAddress: "", physicianOfficeNumber: "",
};

const EMPTY_MEDICAL = 
{
  lastDentalVisit: "",
  previousHospitalizations: "", prescribedMedications: "",
  allergies: "", familyMedicalProblems: "",
  otherMedicalConcerns: "", medicalAlert: "",
  goodHealth: "", underMedicalTreatment: "", medicalTreatmentCondition: "",
  seriousIllness: "", seriousIllnessDetails: "",
  hospitalized: "", hospitalizedDetails: "",
  takingMedication: "", medicationDetails: "",
  useTobacco: "", useAlcoholDrugs: "",
  allergyLocalAnesthetic: false, allergyLatex: false,
  allergyAspirin: false, allergyPenicillinAntibiotics: false,
  allergySulfaDrugs: false, allergyOthers: "",
  bleedingTime: "",
  isPregnant: "", isNursing: "", takingBirthControl: "",
  conditions: [], habits: [], patientDiet: "",
};

function NewPatient() 
{
  const [step, setStep]                       = useState(0);
  const [isMinor, setIsMinor]                 = useState(false);
  const [validationError, setValidationError] = useState("");
  const [photo, setPhoto]                     = useState(null);
  const [showCamera, setShowCamera]           = useState(false);

  const [personal, setPersonal] = useState({ ...EMPTY_PERSONAL });
  const [guardian, setGuardian] = useState({ ...EMPTY_GUARDIAN });
  const [medical, setMedical]   = useState({ ...EMPTY_MEDICAL });

  const stepLabels         = isMinor ? ["Personal", "Guardian", "Medical"] : ["Personal", "Medical"];
  const activeDisplayIndex = isMinor ? step : (step === 0 ? 0 : 1);

  const handleChange = (e) =>
    setPersonal({ ...personal, [e.target.name]: e.target.value });

  const handleGuardianChange = (e) =>
    setGuardian({ ...guardian, [e.target.name]: e.target.value });

  const handleMedicalChange = (e) => 
  {
    const { name, value, type, checked } = e.target;
    setMedical({ ...medical, [name]: type === "checkbox" ? checked : value });
  };

  const toggleCondition = (condition) =>
    setMedical((prev) => (
    {
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }));

  const toggleHabit = (habit) =>
    setMedical((prev) => (
    {
      ...prev,
      habits: prev.habits?.includes(habit)
        ? prev.habits.filter((h) => h !== habit)
        : [...(prev.habits || []), habit],
    }));

  const validateFields = (fields, state) => 
  {
    for (const field of fields) 
    {
      const val = state[field.name];

      if (!val || (typeof val === "string" && val.trim() === "")) 
      {
        return `${field.label} is required.`;
      }
    }
    return "";
  };

  const validatePersonal = () => validateFields(PERSONAL_REQUIRED, personal);
  const validateGuardian = () => validateFields(GUARDIAN_REQUIRED, guardian);
  const validateMedical  = () => validateFields(MEDICAL_REQUIRED, medical);

  const goNext = () => 
  {
    setValidationError("");

    if (step === 0) 
    {
      const err = validatePersonal();
      if (err) 
      {
        setValidationError(err);
        return;
      }
      setStep(isMinor ? 1 : 2);
    } 
    else if (step === 1) 
    {
      const err = validateGuardian();
      if (err) 
      {
        setValidationError(err);
        return;
      }
      setStep(2);
    }
  };

  const goPrev = () => 
  {
    setValidationError("");
    if (step === 2) setStep(isMinor ? 1 : 0);
    else if (step === 1) setStep(0);
  };

  const resetForm = () => 
  {
    setPersonal({ ...EMPTY_PERSONAL });
    setGuardian({ ...EMPTY_GUARDIAN });
    setMedical({ ...EMPTY_MEDICAL });
    setStep(0);
    setIsMinor(false);
    setPhoto(null);
    setValidationError("");
  };

  const handleSubmit = async () => 
  {
    const err = validateMedical();
    if (err) 
    {
      setValidationError(err);
      return;
    }

    try 
    {
      const { data, error } = await supabase
        .from("users")
        .insert([
        {
          first_name:     personal.firstname,
          middle_name:    personal.middlename,
          last_name:      personal.lastname,
          email:          personal.email,
          contact_number: personal.mobile,
          address:        personal.homeAddress,
          role:           "patient",
          password:       "default123",
        }])
        .select();

      if (error) 
      {
        console.error("Insert error:", error);
        alert(error.message);
        return;
      }

      console.log("Inserted:", data);
      alert("Patient successfully added!");
      resetForm();
    } 
    catch (err) 
    {
      console.error("Full error:", err);
      alert(err.message);
    }
  };

  useEffect(() => 
  {
    if (showCamera) 
    {
      navigator.mediaDevices.getUserMedia({ video: true })
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
    if (video?.srcObject) video.srcObject.getTracks().forEach((t) => t.stop());
  };

  const capturePhoto = () => 
  {
    const video  = document.getElementById("video");
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/png"));
    stopCamera();
    setShowCamera(false);
  };

  const YesNoField = ({ label, name, value, subField, subName, subValue }) => (
    <div className="yesno-row">
      <span className="yesno-label">{label}</span>
      <div className="yesno-options">
        <label>
          <input type="radio" name={name} value="yes" checked={value === "yes"} onChange={handleMedicalChange} /> Yes
        </label>
        <label>
          <input type="radio" name={name} value="no" checked={value === "no"} onChange={handleMedicalChange} /> No
        </label>
      </div>
      {subField && value === "yes" && (
        <div className="yesno-subfield-wrap">
          <input className="yesno-subfield" name={subName} placeholder={subField} value={subValue || ""}  onChange={(e) => setMedical({ ...medical, [subName]: e.target.value })} />
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-content">
      <h2 className="page-title">New Patient Information</h2>

      <div className="new-patient-container">
        <div className="stepper">
          {stepLabels.map((label, index) => (
            <div key={index} className={`step ${activeDisplayIndex === index ? "active" : ""}`}>
              <div className="circle">{label[0]}</div>
              <span>{label.toUpperCase()}</span>
            </div>
          ))}
        </div>

        <div className="form-content">
          {step === 0 && (
            <>
              <p className="form-note">Please fill in all required information.</p>

              <div className="personal-form">
                <div className="photo-column">
                  <div className="photo-actions">
                    <button onClick={() => document.getElementById("photoUpload").click()}>Upload</button>
                    <button onClick={() => setShowCamera(true)}>Capture</button>
                  </div>

                  <input id="photoUpload" type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && setPhoto(URL.createObjectURL(e.target.files[0]))}/>
                  
                  <div className="photo-box">
                    {photo ? <img src={photo} alt="Patient" className="photo-preview" /> : "No Photo"}
                  </div>
                </div>

                <div className="form-fields">
                  <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 0.5fr 0.6fr" }}>
                    <div>
                      <label>Lastname <span className="req">*</span></label>
                      <input name="lastname" placeholder="Lastname" value={personal.lastname} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Firstname <span className="req">*</span></label>
                      <input name="firstname" placeholder="Firstname" value={personal.firstname} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Middlename</label>
                      <input name="middlename" placeholder="Middlename" value={personal.middlename} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Suffix</label>
                      <input name="suffix" placeholder="Suffix" value={personal.suffix} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Nickname</label>
                      <input name="nickname" placeholder="Nickname" value={personal.nickname} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "1.2fr 0.5fr 0.7fr 0.8fr 0.8fr" }}>
                    <div>
                      <label>Birthdate <span className="req">*</span></label>
                      <input type="date" name="birthdate" value={personal.birthdate} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Age</label>
                      <input name="age" placeholder="Age" value={personal.age} onChange={handleChange} />
                    </div>
                    
                    <div>
                      <label>Sex <span className="req">*</span></label>
                      <select name="sex" value={personal.sex} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label>Religion <span className="req">*</span></label>
                      <input name="religion" placeholder="Religion" value={personal.religion} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Nationality <span className="req">*</span></label>
                      <input name="nationality" placeholder="Nationality" value={personal.nationality} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "2fr 0.8fr 0.8fr" }}>
                    <div>
                      <label>Home Address <span className="req">*</span></label>
                      <input name="homeAddress" placeholder="Home Address" value={personal.homeAddress} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Home No.</label>
                      <input name="homeNo" placeholder="Home No." value={personal.homeNo} onChange={handleChange} />
                    </div>
                    
                    <div>
                      <label>Fax No.</label>
                      <input name="faxNo" placeholder="Fax No." value={personal.faxNo} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "1fr 0.7fr 1fr 1fr" }}>
                    <div>
                      <label>Occupation <span className="req">*</span></label>
                      <input name="occupation" placeholder="Occupation" value={personal.occupation} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Mobile No. <span className="req">*</span></label>
                      <input name="mobile" placeholder="Mobile Number" value={personal.mobile} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Email <span className="req">*</span></label>
                      <input name="email" placeholder="Email" value={personal.email} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Civil Status <span className="req">*</span></label>
                      <select name="civilStatus" value={personal.civilStatus} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Single</option>
                        <option>Married</option>
                        <option>Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "0.7fr 0.7fr 0.7fr 0.7fr" }}>
                    <div>
                      <label>Blood Type</label>
                      <input name="bloodType" placeholder="Blood Type" value={personal.bloodType} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Blood Pressure</label>
                      <input name="bloodPressure" placeholder="Blood Pressure" value={personal.bloodPressure} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Weight</label>
                      <input name="weight" placeholder="Weight" value={personal.weight} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Height</label>
                      <input name="height" placeholder="Height" value={personal.height} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div>
                      <label>School / Company</label>
                      <input name="school" placeholder="School / Company" value={personal.school} onChange={handleChange} />
                    </div>

                    <div>
                      <label>HMO</label>
                      <input name="hmo" placeholder="HMO" value={personal.hmo} onChange={handleChange} />
                    </div>

                    <div>
                      <label>Referred By</label>
                      <input name="referredBy" placeholder="Referred By" value={personal.referredBy} onChange={handleChange} />
                    </div>
                  </div>

                  <label className="minor-checkbox-row">
                    <input type="checkbox" checked={isMinor} onChange={(e) => {setIsMinor(e.target.checked); setValidationError("");}}/>
                    This patient is a minor (under 18 years old)!
                  </label>
                </div>
              </div>

              {validationError && <div className="validation-error">⚠ {validationError}</div>}

              <div className="form-actions">
                <button className="btn-cancel" onClick={resetForm}>Cancel</button>
                <button className="btn-next" onClick={goNext}>Next →</button>
              </div>
            </>
          )}

          {step === 1 && isMinor && (
            <>
              <p className="form-note">Please fill in parent or guardian information.</p>

              <div className="guardian-form">
                <div className="section-label">Physician Information</div>
                <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <div>
                    <label>Physician's Name <span className="req">*</span></label>
                    <input name="physicianName" placeholder="Physician's Name" value={guardian.physicianName} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Specialty</label>
                    <input name="physicianSpecialty" placeholder="Specialty" value={guardian.physicianSpecialty} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Office Number</label>
                    <input name="physicianOfficeNumber" placeholder="Office Number" value={guardian.physicianOfficeNumber} onChange={handleGuardianChange} />
                  </div>
                </div>

                <div className="field-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div>
                    <label>Office Address</label>
                    <input name="physicianOfficeAddress" placeholder="Office Address" value={guardian.physicianOfficeAddress} onChange={handleGuardianChange} />
                  </div>
                </div>

                <div className="section-label">Father's Information</div>
                <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                  <div>
                    <label>Father's Name <span className="req">*</span></label>
                    <input name="fatherName" placeholder="Father's Name" value={guardian.fatherName} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Occupation</label>
                    <input name="fatherOccupation" placeholder="Occupation" value={guardian.fatherOccupation} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Employer</label>
                    <input name="fatherEmployer" placeholder="Employer" value={guardian.fatherEmployer} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Contact No.</label>
                    <input name="fatherContact" placeholder="Contact Number" value={guardian.fatherContact} onChange={handleGuardianChange} />
                  </div>
                </div>

                <div className="section-label">Mother's Information</div>
                <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                  <div>
                    <label>Mother's Name <span className="req">*</span></label>
                    <input name="motherName" placeholder="Mother's Name" value={guardian.motherName} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Occupation</label>
                    <input name="motherOccupation" placeholder="Occupation" value={guardian.motherOccupation} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Employer</label>
                    <input name="motherEmployer" placeholder="Employer" value={guardian.motherEmployer} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Contact No.</label>
                    <input name="motherContact" placeholder="Contact Number" value={guardian.motherContact} onChange={handleGuardianChange} />
                  </div>
                </div>

                <div className="section-label">Guardian's Information</div>
                <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <div>
                    <label>Guardian's Name</label>
                    <input name="guardianName" placeholder="Guardian's Name" value={guardian.guardianName} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Occupation</label>
                    <input name="guardianOccupation" placeholder="Occupation" value={guardian.guardianOccupation} onChange={handleGuardianChange} />
                  </div>

                  <div>
                    <label>Contact No.</label>
                    <input name="guardianContact" placeholder="Contact Number" value={guardian.guardianContact} onChange={handleGuardianChange} />
                  </div>
                </div>
              </div>

              {validationError && <div className="validation-error">⚠ {validationError}</div>}

              <div className="form-actions">
                <button className="btn-cancel" onClick={goPrev}>← Previous</button>
                <button className="btn-next" onClick={goNext}>Next →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="form-note">Please provide your medical information.</p>

              <div className="medical-form">
                <div className="medical-left">
                  <div className="section-label">Dental History</div>
                  <div className="field-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label>Last Dental Visit <span className="req">*</span></label>
                      <input type="date" name="lastDentalVisit" value={medical.lastDentalVisit} onChange={handleMedicalChange} />
                    </div>
                  </div>

                  <div className="section-label">Health Questions</div>
                  <YesNoField label="1. Are you in good health?"
                    name="goodHealth" value={medical.goodHealth} />
                  <YesNoField label="2. Are you under medical treatment now?"
                    name="underMedicalTreatment" value={medical.underMedicalTreatment}
                    subField="What condition is being treated?"
                    subName="medicalTreatmentCondition"
                    subValue={medical.medicalTreatmentCondition} />
                  <YesNoField label="3. Have you ever had a serious illness or surgical operation?"
                    name="seriousIllness" value={medical.seriousIllness}
                    subField="If so, when and why?"
                    subName="seriousIllnessDetails"
                    subValue={medical.seriousIllnessDetails} />
                  <YesNoField label="4. Have you ever been hospitalized?"
                    name="hospitalized" value={medical.hospitalized}
                    subField="If so, when and why?"
                    subName="hospitalizedDetails"
                    subValue={medical.hospitalizedDetails} />
                  <YesNoField label="5. Are you taking any prescription/non-prescription medication?"
                    name="takingMedication" value={medical.takingMedication}
                    subField="If so, please specify"
                    subName="medicationDetails"
                    subValue={medical.medicationDetails} />
                  <YesNoField label="6. Do you use tobacco products?"
                    name="useTobacco" value={medical.useTobacco} />
                  <YesNoField label="7. Do you use alcohol, cocaine or other dangerous drugs?"
                    name="useAlcoholDrugs" value={medical.useAlcoholDrugs} />

                  <div className="field-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label>8. Are you allergic to any of the following?</label>
                      <div className="allergy-checkboxes">
                        {[
                          { name: "allergyLocalAnesthetic",       label: "Local Anesthetic" },
                          { name: "allergyLatex",                 label: "Latex" },
                          { name: "allergyAspirin",               label: "Aspirin" },
                          { name: "allergyPenicillinAntibiotics", label: "Penicillin / Antibiotics" },
                          { name: "allergySulfaDrugs",            label: "Sulfa Drugs" },
                        ].map(({ name, label }) => (
                          <label key={name} className="condition-item">
                            <input type="checkbox" name={name} checked={medical[name]} onChange={handleMedicalChange} />
                            {label}
                          </label>
                        ))}
                        
                        <div className="allergy-others">
                          <label>Others:</label>
                          <input name="allergyOthers" value={medical.allergyOthers}
                            onChange={handleMedicalChange} placeholder="Specify other allergies" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label>9. Bleeding Time <span className="req">*</span></label>
                      <input name="bleedingTime" value={medical.bleedingTime} onChange={handleMedicalChange} placeholder="Bleeding time" />
                    </div>
                  </div>

                  <div className="section-label">For Women Only</div>
                  <YesNoField label="Are you pregnant?"
                    name="isPregnant" value={medical.isPregnant} />
                  <YesNoField label="Are you nursing?"
                    name="isNursing" value={medical.isNursing} />
                  <YesNoField label="Are you taking birth control pills?"
                    name="takingBirthControl" value={medical.takingBirthControl} />
                </div>

                <div className="medical-right">
                  <div className="conditions">
                    <label>13. Do you have or have you had any of the following?</label>
                    <div className="conditions-grid">
                      {MEDICAL_CONDITIONS.map((condition) => (
                        <label key={condition} className="condition-item">
                          <input type="checkbox" checked={medical.conditions.includes(condition)} onChange={() => toggleCondition(condition)} />
                          {condition}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="conditions">
                    <label>Dental Habits</label>
                    <div className="conditions-grid">
                      {DENTAL_HABITS.map((habit) => (
                        <label key={habit} className="condition-item">
                          <input type="checkbox" checked={medical.habits?.includes(habit)} onChange={() => toggleHabit(habit)} />
                          {habit}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label>Patient's Diet</label>
                      <input name="patientDiet" value={medical.patientDiet || ""} onChange={handleMedicalChange} />
                    </div>
                  </div>

                  <div className="section-label">Other Medical Information</div>
                  <div className="field-grid" style={{ gridTemplateColumns: "1fr" }}>
                    {[
                      { label: "Previous Hospitalizations", name: "previousHospitalizations" },
                      { label: "Prescribed Medications",    name: "prescribedMedications" },
                      { label: "Allergies to Medications",  name: "allergies" },
                      { label: "Family Medical Problems",   name: "familyMedicalProblems" },
                      { label: "Other Medical Concerns",    name: "otherMedicalConcerns" },
                      { label: "Medical Alert",             name: "medicalAlert" },
                    ].map(({ label, name }) => (
                      <div key={name}>
                        <label>{label}</label>
                        <input name={name} value={medical[name]} onChange={handleMedicalChange} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {validationError && <div className="validation-error">⚠ {validationError}</div>}

              <div className="form-actions">
                <button className="btn-cancel" onClick={goPrev}>← Previous</button>
                <button className="btn-next" onClick={handleSubmit}>Finish</button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <video id="video" autoPlay />
            <div className="camera-actions">
              <button className="btn-capture" onClick={capturePhoto}>Capture</button>
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