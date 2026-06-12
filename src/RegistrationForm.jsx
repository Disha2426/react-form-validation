import React, { useState, useMemo } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const COUNTRY_CODES = [
  { code: "+1", label: "+1 (US/CA)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+91", label: "+91 (IN)" },
  { code: "+61", label: "+61 (AU)" },
  { code: "+81", label: "+81 (JP)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+33", label: "+33 (FR)" },
  { code: "+971", label: "+971 (UAE)" },
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "United Arab Emirates",
];

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  countryCode: "+91",
  phone: "",
  country: "",
  city: "",
  pan: "",
  aadhaar: "",
};

/* ------------------------------------------------------------------ */
/*  Validation rules                                                    */
/*  Each validator returns "" when valid, or an error message string.  */
/* ------------------------------------------------------------------ */

const NAME_REGEX = /^[A-Za-z\s'-]{2,40}$/;
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PHONE_REGEX = /^[0-9]{7,12}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^\d{12}$/;

const VALIDATORS = {
  firstName: (v) =>
    !v.trim()
      ? "First name is required."
      : !NAME_REGEX.test(v.trim())
      ? "Only letters, spaces, - and ' allowed (2-40 chars)."
      : "",
  lastName: (v) =>
    !v.trim()
      ? "Last name is required."
      : !NAME_REGEX.test(v.trim())
      ? "Only letters, spaces, - and ' allowed (2-40 chars)."
      : "",
  username: (v) =>
    !v.trim()
      ? "Username is required."
      : !USERNAME_REGEX.test(v.trim())
      ? "3-20 chars: letters, numbers, underscore only."
      : "",
  email: (v) =>
    !v.trim()
      ? "Email is required."
      : !EMAIL_REGEX.test(v.trim())
      ? "Enter a valid email address."
      : "",
  password: (v) =>
    !v
      ? "Password is required."
      : !PASSWORD_REGEX.test(v)
      ? "Min 8 chars, with upper, lower, number & special char."
      : "",
  phone: (v) =>
    !v.trim()
      ? "Phone number is required."
      : !PHONE_REGEX.test(v.trim())
      ? "Enter 7-12 digits, numbers only."
      : "",
  country: (v) => (!v ? "Please select a country." : ""),
  city: (v) =>
    !v.trim()
      ? "City is required."
      : v.trim().length < 2
      ? "City name looks too short."
      : "",
  pan: (v) =>
    !v.trim()
      ? "PAN is required."
      : !PAN_REGEX.test(v.trim().toUpperCase())
      ? "Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)."
      : "",
  aadhaar: (v) =>
    !v.trim()
      ? "Aadhaar number is required."
      : !AADHAAR_REGEX.test(v.trim())
      ? "Aadhaar must be exactly 12 digits."
      : "",
};

const FIELD_KEYS = Object.keys(VALIDATORS);

function validateAll(form) {
  const errors = {};
  FIELD_KEYS.forEach((key) => {
    errors[key] = VALIDATORS[key](form[key]);
  });
  return errors;
}

/* ------------------------------------------------------------------ */
/*  Reusable form field                                                 */
/* ------------------------------------------------------------------ */

function Field({
  label,
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  maxLength,
  rightSlot,
  children,
}) {
  const showError = touched && error;
  return (
    <div style={styles.fieldWrap}>
      <label htmlFor={name} style={styles.label}>
        {label}
      </label>
      <div style={styles.inputRow}>
        {children ? (
          children
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!showError}
            style={{
              ...styles.input,
              ...(showError ? styles.inputError : {}),
              ...(rightSlot ? { paddingRight: 44 } : {}),
            }}
          />
        )}
        {rightSlot}
      </div>
      {showError && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Registration form page                                              */
/* ------------------------------------------------------------------ */

function RegistrationForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const errors = useMemo(() => validateAll(form), [form]);
  const isValid = useMemo(
    () => Object.values(errors).every((e) => !e),
    [errors]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = FIELD_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);
    if (!isValid) return;

    navigate("/success", {
      state: {
        ...form,
        pan: form.pan.toUpperCase(),
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>All fields are required.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.grid2}>
            <Field
              label="First name"
              name="firstName"
              value={form.firstName}
              error={errors.firstName}
              touched={touched.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              
            />
            <Field
              label="Last name"
              name="lastName"
              value={form.lastName}
              error={errors.lastName}
              touched={touched.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              
            />
          </div>

          <Field
            label="Username"
            name="username"
            value={form.username}
            error={errors.username}
            touched={touched.username}
            onChange={handleChange}
            onBlur={handleBlur}
            
          />

          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            error={errors.email}
            touched={touched.email}
            onChange={handleChange}
            onBlur={handleBlur}
            
          />

          <Field
            label="Password"
            name="password"
            value={form.password}
            error={errors.password}
            touched={touched.password}
            onChange={handleChange}
            onBlur={handleBlur}
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={styles.eyeBtn}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />

          <div style={styles.fieldWrap}>
            <label htmlFor="phone" style={styles.label}>
              Phone number
            </label>
            <div style={styles.phoneRow}>
              <select
                name="countryCode"
                value={form.countryCode}
                onChange={handleChange}
                style={styles.codeSelect}
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                
                aria-invalid={!!(touched.phone && errors.phone)}
                style={{
                  ...styles.input,
                  flex: 1,
                  ...(touched.phone && errors.phone
                    ? styles.inputError
                    : {}),
                }}
              />
            </div>
            {touched.phone && errors.phone && (
              <span style={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div style={styles.grid2}>
            <Field
              label="Country"
              name="country"
              value={form.country}
              error={errors.country}
              touched={touched.country}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!(touched.country && errors.country)}
                style={{
                  ...styles.input,
                  ...(touched.country && errors.country
                    ? styles.inputError
                    : {}),
                }}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="City"
              name="city"
              value={form.city}
              error={errors.city}
              touched={touched.city}
              onChange={handleChange}
              onBlur={handleBlur}
             
            />
          </div>

          <div style={styles.grid2}>
            <Field
              label="PAN number"
              name="pan"
              value={form.pan}
              error={errors.pan}
              touched={touched.pan}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "pan",
                    value: e.target.value.toUpperCase(),
                  },
                })
              }
              onBlur={handleBlur}
              
              maxLength={10}
            />
            <Field
              label="Aadhaar number"
              name="aadhaar"
              value={form.aadhaar}
              error={errors.aadhaar}
              touched={touched.aadhaar}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "aadhaar",
                    value: e.target.value.replace(/\D/g, ""),
                  },
                })
              }
              onBlur={handleBlur}
              
              maxLength={12}
              type="tel"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            style={{
              ...styles.submitBtn,
              ...(isValid ? {} : styles.submitBtnDisabled),
            }}
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Success / details page                                              */
/* ------------------------------------------------------------------ */

function SuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <Navigate to="/" replace />;

  const rows = [
    ["First name", state.firstName],
    ["Last name", state.lastName],
    ["Username", state.username],
    ["Email", state.email],
    ["Phone", `${state.countryCode} ${state.phone}`],
    ["Country", state.country],
    ["City", state.city],
    ["PAN", state.pan],
    ["Aadhaar", state.aadhaar],
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Registration successful</h1>
        <p style={styles.subtitle}>Here are the details you submitted.</p>

        <div style={styles.detailsList}>
          {rows.map(([label, value]) => (
            <div key={label} style={styles.detailRow}>
              <span style={styles.detailLabel}>{label}</span>
              <span style={styles.detailValue}>{value}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={styles.submitBtn}
        >
          Back to form
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "32px 16px",
    boxSizing: "border-box",
    background: "var(--color-background-tertiary, #f5f5f4)",
    fontFamily:
      "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "var(--color-background-primary, #fff)",
    borderRadius: 12,
    border: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
    padding: "28px 24px",
    boxSizing: "border-box",
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    margin: "0 0 4px",
    color: "var(--color-text-primary, #1a1a1a)",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--color-text-secondary, #6b6b6b)",
    margin: "0 0 20px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    color: "var(--color-text-primary, #1a1a1a)",
  },
  inputRow: {
    position: "relative",
    display: "flex",
  },
  input: {
    width: "100%",
    height: 38,
    padding: "0 12px",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid var(--color-border-secondary, #d4d4d4)",
    outline: "none",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary, #1a1a1a)",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  inputError: {
    borderColor: "var(--color-border-danger, #d4453a)",
    boxShadow: "0 0 0 1px var(--color-border-danger, #d4453a)",
  },
  errorText: {
    fontSize: 12,
    color: "var(--color-text-danger, #c0392b)",
    marginTop: 4,
  },
  eyeBtn: {
    position: "absolute",
    right: 6,
    top: 4,
    height: 30,
    padding: "0 10px",
    fontSize: 12,
    fontWeight: 500,
    border: "none",
    background: "transparent",
    color: "var(--color-text-secondary, #6b6b6b)",
    cursor: "pointer",
    borderRadius: 6,
  },
  phoneRow: {
    display: "flex",
    gap: 8,
  },
  codeSelect: {
    height: 38,
    padding: "0 8px",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid var(--color-border-secondary, #d4d4d4)",
    background: "var(--color-background-primary, #fff)",
    color: "var(--color-text-primary, #1a1a1a)",
    width: 130,
    flexShrink: 0,
  },
  submitBtn: {
    width: "100%",
    height: 42,
    marginTop: 8,
    fontSize: 15,
    fontWeight: 500,
    color: "#fff",
    background: "#1a1a1a",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "opacity 0.15s ease",
  },
  submitBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginBottom: 20,
    border: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
    borderRadius: 8,
    overflow: "hidden",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 14px",
    fontSize: 14,
    borderBottom: "0.5px solid var(--color-border-tertiary, #e5e5e5)",
  },
  detailLabel: {
    color: "var(--color-text-secondary, #6b6b6b)",
  },
  detailValue: {
    fontWeight: 500,
    color: "var(--color-text-primary, #1a1a1a)",
    textAlign: "right",
    wordBreak: "break-word",
  },
};

/* ------------------------------------------------------------------ */
/*  App / routing                                                       */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
