# Careers job board - setup and operations

Everything the careers feature needs, in the order it has to happen.

## 1. Create the schema

Run **`supabase/careers_job_board.sql`** once in the Supabase SQL Editor
(or `supabase db push` if you move it into `supabase/migrations/`).
It is idempotent, so re-running it is safe.

It creates:

| Object | What it is |
| --- | --- |
| `public.job_admins` | Allow-list of staff who may see applicant data |
| `public.is_job_admin()` | Helper used by every admin policy |
| `public.job_listings` | The roles themselves |
| `public.job_questions` | Per-role screening questions (incl. the answer keys) |
| `public.open_job_questions` | Public view of the questions **without** the answer keys |
| `public.job_applications` | Applicant records - sensitive personal information |
| `public.job_application_answers` | Their questionnaire answers |
| `public.job_application_counts()` | Per-role counts for the dashboard |
| `public.purge_expired_job_applications()` | Retention purge |
| `job-applications` storage bucket | Private CV storage, 5 MB limit |

Then run **`supabase/careers_verify.sql`** in a new query tab. It is read-only
and prints a PASS/FAIL row for every table, policy, RLS flag and the storage
bucket, and lists everyone who can see applicant data.

If the storage section of the migration printed a *warning* rather than a
notice, the role running it could not write to the `storage` schema. Create the
bucket by hand (Storage → New bucket, name `job-applications`, **not** public,
5 MB limit) and add these two policies under Storage → Policies:

| Policy | Operation | Target roles | USING expression |
| --- | --- | --- | --- |
| Admins read resumes | SELECT | `authenticated` | `bucket_id = 'job-applications' AND public.is_job_admin()` |
| Admins delete resumes | DELETE | `authenticated` | `bucket_id = 'job-applications' AND public.is_job_admin()` |

### Check the admin allow-list straight afterwards

The script seeds `job_admins` with **every existing `auth.users` row**, on the
basis that this project has no public sign-up and all auth users are staff.
Confirm that is still true:

```sql
select user_id, email from public.job_admins;
```

Remove anyone who should not see applications, and add new admins with:

```sql
insert into public.job_admins (user_id, email)
select id, email from auth.users where email = 'new.admin@example.com'
on conflict (user_id) do nothing;
```

An admin who is **not** in this table sees the Careers sections as empty - that
is the allow-list doing its job, not a bug.

## 2. Deploy the Edge Function

Already deployed to `gjeepzarenavlrnpvyee`. To redeploy after a change:

```bash
supabase functions deploy submit-job-application
```

This function is the only write path into `job_applications`. The anon key has
no insert, update or select rights on applicant data at all.

### Secrets it uses

| Secret | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | provided by the platform | DB + storage writes |
| `RESEND_API_KEY` | for emails | already set for the registration webhooks |
| `SITE_URL` | recommended | links in emails, CORS allow-list |
| `CAREERS_NOTIFY_EMAIL` | optional | where new-application alerts go (default `kotp.football@gmail.com`) |
| `APPLICATION_IP_SALT` | optional | HMAC key for rate-limit hashes; falls back to the service key |

```bash
supabase secrets set CAREERS_NOTIFY_EMAIL=careers@kingofthepitch.com.au
supabase secrets set APPLICATION_IP_SALT="$(openssl rand -hex 32)"
```

## 3. Post a role

Admin dashboard → **Careers → Job Listings → New role**.

A role stays a **draft** (invisible to the public) until you publish it.
"Save & publish" sets it to `open`, which is the only status the public can read.
Setting an **applications close** date stops new applications after that day,
both in the UI and in the function.

### Screening questions

Each role can carry its own questions. Mark one as a *screening requirement* and
set the accepted answers; an application that does not meet it is refused before
anything is written, so no record and no file are stored. The accepted answers
are never sent to an applicant's browser - the public form reads
`open_job_questions`, which omits those columns.

## 4. How applicant data is protected

- **No public database access.** `job_applications` and
  `job_application_answers` have no `anon` policies. Submissions go through the
  Edge Function; reads require membership of `job_admins`.
- **Private CV storage.** The `job-applications` bucket is private with no public
  read policy. Admins open a CV through a signed URL that expires after two
  minutes, minted per click.
- **Validated input.** The function checks types, lengths, URL schemes (http/https
  only), file extension, MIME type and file signature, and refuses anything else.
- **Rate limited.** Five applications per hour per IP hash, three per hour per
  email address, one application per person per role.
- **No raw IP addresses.** Only a salted HMAC is stored, for rate limiting.
- **Recorded consent.** Every application stores the consent flag, the consent
  text version and a timestamp.
- **Data minimisation.** Applicants who fail a screening requirement are never
  stored at all.

## 5. Retention

Each application gets `delete_after = submitted + 2 years`, matching the
statement in the privacy policy. Purge expired records (everything except
`hired`) with:

```sql
select public.purge_expired_job_applications();
```

Run it from a scheduled job if `pg_cron` is enabled:

```sql
select cron.schedule(
  'purge-expired-job-applications', '0 3 * * 0',
  $$select public.purge_expired_job_applications()$$
);
```

Deleting an application from the dashboard removes its CV from storage in the
same action.

## 6. Handling an applicant's privacy request

```sql
-- Find them
select id, reference, email, status, created_at
from public.job_applications
where email = 'applicant@example.com';
```

For access or correction, use the dashboard. For erasure, delete from the
dashboard rather than with SQL - that path removes the stored CV too. If you do
delete with SQL, remove the object named by `resume_path` from the
`job-applications` bucket as well.
