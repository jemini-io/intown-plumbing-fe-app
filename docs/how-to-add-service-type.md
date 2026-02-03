
# Adding a New Service Type (tied to ServiceTitan)

This is for a non‑technical admin who needs to add a **new service type** in ServiceTitan and wire it into the Intown Virtual Consultation app.

---

### 0. Before You Start

- [ ] You can log into **ServiceTitan Integration / Test tenant**
- [ ] You can log into the **Intown admin dashboard – test environment**
- [ ] You know which **business unit** and **campaign** the app uses (ask engineering if unsure)

---

### 1. ServiceTitan Setup (Integration / Test Tenant)

**Goal: create / confirm the Job Type the app will point at.**

- [ ] In ServiceTitan (Integration / Test), go to **Settings → Job Types**
- [ ] Either:
  - [ ] **Create a new Job Type** for this service, or
  - [ ] **Reuse** an existing Job Type (only if ops has decided this)
- [ ] For a **new Job Type**, set:
  - [ ] **Name** – e.g. `Virtual Consult – Leak Detection`
  - [ ] **Business Unit** – must include the BU the app is configured to use
  - [ ] **Campaign** – must be the virtual consult campaign the app uses
  - [ ] **Pricebook / SKU** – make sure the visit uses the configured **Virtual Service SKU** (same pattern as existing virtual consult jobs)
- [ ] **If this service should be limited by skills**:
  - [ ] Create / confirm skills in ServiceTitan (e.g. `Virtual Service`, `Virtual Quote - Remodel Project`, etc.)
  - [ ] Assign these skills to:
    - [ ] The **technicians** who can do this work
    - [ ] The **Job Type**, if your ST setup uses skill‑based routing

---

### 2. Capture the Exact ServiceTitan IDs

You need two pieces of data from ServiceTitan:

- [ ] **Job Type ID** → will become `serviceTitanId` in the app
  - [ ] Confirm it’s a **number only** (e.g. `78455317`, no spaces or letters)
  - [ ] Get it from:
    - [ ] The Job Type’s URL (ID in the URL), or
    - [ ] A report / export listing Job Types with IDs
- [ ] **Job Type Name** → will become `serviceTitanName` in the app
  - [ ] Copy the name **exactly** (same spelling / case as in ST)

You **do not** change these when adding a service type:

- [ ] `serviceTitan.businessUnitId`
- [ ] `serviceTitan.campaignId`
- [ ] `serviceTitan.virtualServiceSkuId`
- [ ] `serviceTitan.stripePaymentTypeId`

Those are app‑level settings and are already configured by engineering.

---

### 3. Intown Dashboard – What You Actually Edit

For most new services that reuse existing skills you only touch:

- [ ] **Services** (Dashboard → Services card → “Add Service”)

Only if you are introducing **new skills or different tech/skill mapping** do you also touch:

- [ ] **Skills** (Dashboard → Skills)
- [ ] **Technicians** (Dashboard → Technicians → per‑technician Skills)

In practice, ops usually:

- [ ] Reuse existing skills
- [ ] Only add a new Service

---

### 4. Step‑by‑Step: Wire the Service in the Intown Dashboard (Test Env)

#### 4.1 In ServiceTitan (quick recap)

- [ ] Job Type exists in **Integration / Test** tenant
- [ ] Job Type:
  - [ ] Uses correct **Business Unit**
  - [ ] Uses correct **Campaign**
  - [ ] Uses the same **virtual consult SKU** pattern as other virtual consult jobs
- [ ] You have written down:
  - [ ] **Job Type ID** (numeric)
  - [ ] **Job Type Name**

#### 4.2 Services (Test dashboard)

- [ ] Go to **admin dashboard – test env**
- [ ] Open **Services** card
- [ ] Click **Add Service**
- [ ] Fill in:
  - [ ] **Display Name** – what customer sees in booking UI (e.g. `Leak Detection Consult`)
  - [ ] **ServiceTitan ID** – paste the numeric **Job Type ID** (numbers only)
  - [ ] **ServiceTitan Name** – paste the **Job Type Name** exactly
  - [ ] **Emoji** – 1–2 characters (e.g. `🔧`, `🚨`)
  - [ ] **Icon** – one of the app’s icon names (e.g. `wrench`, `siren`, `contract`); copy from similar existing service if unsure
  - [ ] **Enabled** – turn **ON** if you want customers to see this service
  - [ ] **Description** – short customer‑facing description
  - [ ] **Associated Skills** – check the skills required for this service (optional but recommended so routing / filtering behaves)
- [ ] Click **Save**
- [ ] Confirm you see **“Service created successfully!”**

This change is live for the **test** booking flow immediately once `Enabled` is true.

#### 4.3 Skills & Technician Mapping (only if new skills are needed)

- [ ] In **Skills**:
  - [ ] Add any new skills you need
  - [ ] Use names that make sense to ops; they **do not** need to match ServiceTitan skill names 1:1
- [ ] In **Technicians**:
  - [ ] For each tech who should be able to run this service, open their record
  - [ ] Enable the relevant skills

---

### 5. Optional Sanity Check – App Settings View

The app exposes a virtual “App Setting” called `serviceToJobTypes` that is **generated from the Services table**.

- [ ] Go to Dashboard → **Settings → App Settings**
- [ ] Find the `serviceToJobTypes` row
- [ ] Confirm your new service appears with:
  - [ ] Correct `serviceTitanId`
  - [ ] Correct `serviceTitanName`
  - [ ] `enabled: true` (if you turned it on)

**Note:**  
This JSON is **derived** from the DB. You normally manage services via the **Services** form, not by hand‑editing this JSON. Treat this view as a **diagnostic / read‑mostly** view.

(If someone *does* edit here, some fields/IDs are locked and changes flow back into the DB; that’s a “last resort, engineering only” move.)

---

### 6. Validation – ServiceTitan Integration / Test Environment

Do all of this in **test** first.

#### 6.1 Confirm ServiceTitan sees your Job Type

This uses the `getJobTypesByServiceTitanIds` helper.

- [ ] Ask engineering (or use their admin tools) to run `getJobTypesByServiceTitanIds`
  - It:
    - [ ] Reads all services from the DB
    - [ ] Sends their `serviceTitanId`s to ServiceTitan
    - [ ] Filters to only Job Types in the configured **Business Unit**
- [ ] Confirm your new Job Type appears in that list
  - If not, likely causes:
    - [ ] Wrong Job Type ID in the Services form
    - [ ] Job Type inactive in ServiceTitan
    - [ ] Job Type assigned to the wrong Business Unit

#### 6.2 Book a test through the Intown app (test env)

- [ ] Open the **test** booking URL for the app
- [ ] Choose your **new service type**
- [ ] Fill in dummy test data
- [ ] Submit the booking

#### 6.3 Verify the created job in ServiceTitan (Integration / Test)

- [ ] Find the job created by your test booking
- [ ] Confirm:
  - [ ] **Job Type** name matches the new Job Type’s name
  - [ ] **Job Type ID** matches the `serviceTitanId` you configured
  - [ ] **Business Unit** is the one configured in the app
  - [ ] **Campaign** is the virtual consult campaign configured in the app
  - [ ] **Pricebook item / SKU** matches the configured `virtualServiceSkuId` pattern (same as other virtual consult jobs)

#### 6.4 If skills are wired for this service

- [ ] Try assigning / dispatching jobs
- [ ] Confirm:
  - [ ] Job can be assigned only to technicians who have the required skills
  - [ ] If dispatch ignores skills, revisit how skills are assigned in ServiceTitan and in the Intown **Skills / Technicians** screens

*(If there are background jobs / notifications that rely on a YAML config of `serviceToJobTypes`, engineering may also need to add the new service to that config. The Services screen alone won’t update YAML configs.)*

---

### 7. Promote to Production

Once test env checks are good:

- [ ] Repeat **ServiceTitan Job Type** setup in the **production** tenant:
  - [ ] Create/confirm the same Job Type
  - [ ] Use the production BU, campaign, and SKU
- [ ] In the **production Intown dashboard**:
  - [ ] Add the same service in **Services** with:
    - [ ] The **production** Job Type ID
    - [ ] The **production** Job Type Name
    - [ ] Enabled toggle set appropriately
- [ ] Book a quick **internal test** in production:
  - [ ] Use an internal test customer
  - [ ] Confirm the Job Type wiring in ServiceTitan as in section 6.3

---

### 8. Quick Reference (TL;DR)

- **From ServiceTitan you need:**
  - [ ] **Job Type ID (number)** → `ServiceTitan ID` in the Services form
  - [ ] **Job Type Name** → `ServiceTitan Name` in the Services form
- **Dashboard screens you usually touch:**
  - [ ] **Services** → always
  - [ ] **Skills** → only if defining new skills
  - [ ] **Technicians** → only if changing which techs can do which skills
- **If something looks wrong:**
  - [ ] First check the **Services** form for typos / wrong ID
  - [ ] Then check the **ServiceTitan Job Type** config (BU, campaign, active)
  - [ ] Then look at **App Settings → `serviceToJobTypes`** as a mirror of what’s in the DB