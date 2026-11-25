CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE patients_gender_enum AS ENUM ('Female', 'Male', 'Other');
CREATE TYPE bills_status_enum AS ENUM ('Pending', 'Paid', 'Failed', 'Cancelled');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email varchar(254) NOT NULL UNIQUE,
  password_hash varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  age smallint NOT NULL CHECK (age BETWEEN 0 AND 125),
  gender patients_gender_enum NOT NULL,
  phone varchar(30) NOT NULL,
  email varchar(254) NOT NULL UNIQUE,
  address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  description varchar(240) NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  tax numeric(12, 2) NOT NULL CHECK (tax >= 0),
  total_amount numeric(12, 2) NOT NULL CHECK (total_amount = amount + tax),
  status bills_status_enum NOT NULL DEFAULT 'Pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bills_patient_id_idx ON bills(patient_id);
CREATE INDEX bills_status_idx ON bills(status);
