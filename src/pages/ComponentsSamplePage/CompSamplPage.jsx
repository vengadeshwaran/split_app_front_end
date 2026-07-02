import React, { useState } from "react";
import InputText from "../../components/InputText"; // Only use InputText since you're using it
import PrimaryButton from "../../components/PrimaryButton";
import InputDropDownBox from "../../components/InputDropDownBox";
import InputCheckBox from "../../components/InputCheckBox";
import InputRadio from "../../components/InputRadio";
import InputField from "../../components/InputField";

export default function CompsamplPage() {
  const countries = [
    { value: "ae", label: "United Arab Emirates" },
    { value: "in", label: "India" },
    { value: "sa", label: "Saudi Arabia" },
  ];

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    description: "",
    role: "",
    dob: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [accepted, setAccepted] = useState(false);

  // ✅ Unified handleChange for both custom and native inputs
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Please select a role";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <section className="w-full h-full mx-auto bg-component-light dark:bg-component-dark">
      <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow bg-component-light dark:bg-component-dark">
        <h2 className="text-xl font-semibold mb-4">Reusable Input Demo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ InputText should receive the correct prop names */}
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            type="email"
            error={errors.email}
            required
          />

          <InputField
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            type="password"
            error={errors.password}
            required
          />

          <InputDropDownBox
            label="Country"
            required
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            options={countries}
            placeholder="Select Country"
            helperText="Choose your country of residence."
          />

          <InputRadio
            label="Gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={genders}
            required
            helperText="Select your gender."
          />

          <InputCheckBox
            label="I agree to the Terms & Conditions"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
            helperText="You must accept before continuing."
          />

          <PrimaryButton type="submit" loading={loading}>
            Complete Registration
          </PrimaryButton>
        </form>
      </div>
    </section>
  );
}
