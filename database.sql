create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  firebase_id character varying(255) null,
  name character varying(255) not null,
  last_name character varying(255) not null,
  document_type character varying(50) not null,
  document_number character varying(50) not null,
  email character varying(255) not null,
  date_birth date null,
  phone character varying(20) null,
  role character varying(50) not null,
  is_admin boolean null default false,
  status character(1) null default 'A'::bpchar,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null,
  constraint users_pkey primary key (id),
  constraint users_document_number_key unique (document_number),
  constraint users_email_key unique (email),
  constraint users_firebase_id_key unique (firebase_id),
  constraint users_role_check check (
    (
      (role)::text = any (
        (
          array[
            'teacher'::character varying,
            'student'::character varying,
            'treasury'::character varying,
            'secretariat'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint users_status_check check ((status = any (array['A'::bpchar, 'I'::bpchar])))
) TABLESPACE pg_default;

create table public.students (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  career_id uuid not null,
  admission_date date not null default CURRENT_DATE,
  tutor_id uuid null,
  constraint students_pkey primary key (id),
  constraint students_career_id_fkey foreign KEY (career_id) references careers (id) on delete CASCADE,
  constraint students_tutor_id_fkey foreign KEY (tutor_id) references users (id) on delete set null,
  constraint students_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.student_recoverable_units (
  id uuid not null default extensions.uuid_generate_v4 (),
  period_id uuid not null,
  student_id uuid not null,
  didactic_unit_id uuid not null,
  semester integer not null,
  original_grade numeric(3, 1) not null,
  is_approved boolean not null default false,
  registered_by uuid not null,
  registered_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint student_recoverable_units_pkey primary key (id),
  constraint student_recoverable_units_unique unique (period_id, student_id, didactic_unit_id),
  constraint student_recoverable_units_unit_fkey foreign KEY (didactic_unit_id) references didactic_units (id),
  constraint student_recoverable_units_registered_by_fkey foreign KEY (registered_by) references users (id),
  constraint student_recoverable_units_period_fkey foreign KEY (period_id) references periods (id),
  constraint student_recoverable_units_student_fkey foreign KEY (student_id) references users (id),
  constraint student_recoverable_units_semester_check check (
    (
      (semester >= 1)
      and (semester <= 6)
    )
  )
) TABLESPACE pg_default;

create trigger trigger_set_semester BEFORE INSERT on student_recoverable_units for EACH row
execute FUNCTION set_recoverable_unit_semester ();

create table public.recovery_requests (
  id uuid not null default extensions.uuid_generate_v4 (),
  correlative character varying(20) not null,
  student_id uuid not null,
  period_id uuid not null,
  message text not null,
  total_cost numeric(10, 2) not null,
  status character varying(20) not null default 'pendiente'::character varying,
  teacher_response text null,
  treasury_response text null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null,
  constraint recovery_requests_pkey primary key (id),
  constraint recovery_requests_correlative_key unique (correlative),
  constraint recovery_requests_period_id_fkey foreign KEY (period_id) references periods (id),
  constraint recovery_requests_student_id_fkey foreign KEY (student_id) references users (id) on update CASCADE,
  constraint recovery_requests_correlative_check check (
    (
      (correlative)::text ~ '^N°[0-9]{5}-[0-9]{4}$'::text
    )
  ),
  constraint recovery_requests_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pendiente'::character varying,
            'en_revision'::character varying,
            'aprobado'::character varying,
            'rechazado'::character varying,
            'pagado'::character varying,
            'en_curso'::character varying,
            'finalizado'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint recovery_requests_total_cost_check check ((total_cost > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_recovery_requests_status on public.recovery_requests using btree (status) TABLESPACE pg_default;

create index IF not exists idx_recovery_requests_student on public.recovery_requests using btree (student_id) TABLESPACE pg_default;

create index IF not exists idx_recovery_requests_period on public.recovery_requests using btree (period_id) TABLESPACE pg_default;

create table public.recovery_request_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  request_id uuid not null,
  didactic_unit_id uuid not null,
  semester integer not null,
  status character varying(20) not null default 'pendiente'::character varying,
  original_grade numeric(3, 1) null,
  recovery_grade numeric(3, 1) null,
  constraint recovery_request_details_pkey primary key (id),
  constraint recovery_request_details_didactic_unit_id_fkey foreign KEY (didactic_unit_id) references didactic_units (id),
  constraint recovery_request_details_request_id_fkey foreign KEY (request_id) references recovery_requests (id) on delete CASCADE,
  constraint recovery_request_details_semester_check check (
    (
      (semester >= 1)
      and (semester <= 6)
    )
  ),
  constraint recovery_request_details_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pendiente'::character varying,
            'aprobado'::character varying,
            'rechazado'::character varying,
            'en_curso'::character varying,
            'finalizado'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_details_request on public.recovery_request_details using btree (request_id) TABLESPACE pg_default;

create index IF not exists idx_details_status on public.recovery_request_details using btree (status) TABLESPACE pg_default;

create table public.recovery_payment_vouchers (
  id uuid not null default extensions.uuid_generate_v4 (),
  request_id uuid not null,
  file_url text not null,
  file_name character varying(255) not null,
  status character varying(20) not null default 'subido'::character varying,
  uploaded_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  rejection_reason text null,
  reviewed_by uuid null,
  constraint recovery_payment_vouchers_pkey primary key (id),
  constraint recovery_payment_vouchers_request_id_fkey foreign KEY (request_id) references recovery_requests (id) on delete CASCADE,
  constraint recovery_payment_vouchers_reviewed_by_fkey foreign KEY (reviewed_by) references users (id),
  constraint recovery_payment_vouchers_status_check check (
    (
      (status)::text = any (
        (
          array[
            'subido'::character varying,
            'verificado'::character varying,
            'rechazado'::character varying,
            'resubido'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_vouchers_request on public.recovery_payment_vouchers using btree (request_id) TABLESPACE pg_default;

create index IF not exists idx_vouchers_status on public.recovery_payment_vouchers using btree (status) TABLESPACE pg_default;

create table public.configurations (
  id uuid not null default extensions.uuid_generate_v4 (),
  key character varying(255) not null,
  value text not null,
  description character varying(255) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null,
  constraint configurations_pkey primary key (id),
  constraint configurations_key_key unique (key)
) TABLESPACE pg_default;

create trigger trigger_update_units_cost
after
update on configurations for EACH row
execute FUNCTION update_units_cost ();

create table public.careers (
  id uuid not null default extensions.uuid_generate_v4 (),
  name character varying(255) not null,
  code character varying(10) not null,
  constraint careers_pkey primary key (id),
  constraint careers_code_key unique (code),
  constraint careers_name_key unique (name)
) TABLESPACE pg_default;


create table public.periods (
  id uuid not null default extensions.uuid_generate_v4 (),
  code character varying(10) not null,
  year integer not null,
  period character varying(2) not null,
  career_id uuid not null,
  start_date date not null,
  end_date date not null,
  constraint periods_pkey primary key (id),
  constraint periods_code_key unique (code),
  constraint periods_career_id_fkey foreign KEY (career_id) references careers (id) on delete CASCADE,
  constraint periods_period_check check (
    (
      (period)::text = any (
        (
          array['I'::character varying, 'II'::character varying]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;


create table public.didactic_units (
  id uuid not null default extensions.uuid_generate_v4 (),
  unit_name character varying(255) not null,
  short_name character varying(50) not null,
  credits integer not null,
  cost numeric(10, 2) not null,
  career_id uuid not null,
  semester integer not null,
  teacher_id uuid null,
  constraint didactic_units_pkey primary key (id),
  constraint didactic_units_career_id_fkey foreign KEY (career_id) references careers (id) on delete CASCADE,
  constraint didactic_units_teacher_id_fkey foreign KEY (teacher_id) references users (id) on delete set null,
  constraint didactic_units_cost_check check ((cost >= (0)::numeric)),
  constraint didactic_units_credits_check check ((credits > 0)),
  constraint didactic_units_semester_check check (
    (
      (semester >= 1)
      and (semester <= 6)
    )
  )
) TABLESPACE pg_default;

create trigger trigger_calculate_cost BEFORE INSERT
or
update on didactic_units for EACH row
execute FUNCTION calculate_unit_cost ();
