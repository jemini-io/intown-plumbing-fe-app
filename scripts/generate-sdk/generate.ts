import { generate } from 'openapi-typescript-codegen';
import { SERVICE_TITAN_APIS, GENERATION_CONFIG } from './config';
import { join } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';

async function generateSDK() {
  console.log('🚀 Starting ServiceTitan SDK generation...\n');

  for (const api of SERVICE_TITAN_APIS) {
    console.log(`📦 Generating ${api.name} SDK...`);
    
    try {
      // Clean output directory
      if (existsSync(api.outputPath)) {
        rmSync(api.outputPath, { recursive: true, force: true });
      }
      mkdirSync(api.outputPath, { recursive: true });

      // Generate SDK
      await generate({
        input: api.specPath,
        output: api.outputPath,
        useUnionTypes: GENERATION_CONFIG.useUnionTypes,
        useOptions: GENERATION_CONFIG.useOptions,
        exportSchemas: GENERATION_CONFIG.exportSchemas,
        exportServices: GENERATION_CONFIG.exportServices,
        exportCore: GENERATION_CONFIG.exportCore,
        exportModels: GENERATION_CONFIG.exportModels
      });

      console.log(`✅ Generated ${api.name} SDK successfully`);
    } catch (error) {
      console.error(`❌ Failed to generate ${api.name} SDK:`, error);
      process.exit(1);
    }
  }

  console.log('\n All SDKs generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Review generated code in lib/servicetitan/generated/');
  console.log('2. Create unified client wrapper in lib/servicetitan/client/');
  console.log('3. Update imports in your application');
}

generateSDK().catch(console.error); 