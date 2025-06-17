# Service Titan SDK

All files in this folder (`/app/api/servicetitan-api`) should only provide strongly typed methods to call the ServiceTitan API.

## Instructions For the SDK

1. Each Service Titan API doc is found in `res/service-titan`. Ex. `res/service-titan/tenant-dispatch-v2.yaml`
2. Each doc should have a corresponding folder. Ex. `app/servicetitan-api/dispatch/`
3. Each tag section should have it's own file. Ex. `app/servicetitan-api/dispatch/export`
4. Each file should export a single Class service that is modeled after `app/api/servicetitan-api/job-planning-management/job-types.ts`
5. All types should be exported and kept in an adjacent `types.ts` file.
