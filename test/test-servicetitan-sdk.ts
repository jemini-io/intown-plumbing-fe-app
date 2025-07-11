import { ServiceTitanClient } from '@/lib/servicetitan';
import { AuthService } from '@/app/api/services/services';
import { env } from '@/lib/config/env';

async function testServiceTitanSDK() {
  console.log('🧪 Testing ServiceTitan SDK with live API calls...\n');

  try {
    // Step 1: Get real auth token
    console.log('1. Getting authentication token...');
    const authService = new AuthService(env.environment);
    const authToken = await authService.getAuthToken(
      env.servicetitan.clientId,
      env.servicetitan.clientSecret
    );
    console.log('✅ Auth token obtained successfully');

    // Step 2: Create client with real auth
    console.log('\n2. Creating ServiceTitan client...');
    const client = new ServiceTitanClient({
      authToken,
      appKey: env.servicetitan.appKey,
      tenantId: env.servicetitan.tenantId
    });
    console.log('✅ Client created successfully');

    // Step 3: Test service availability
    console.log('\n3. Testing service availability...');
    console.log('Dispatch services:', Object.keys(client.dispatch));
    console.log('JPM services:', Object.keys(client.jpm));
    console.log('Pricebook services:', Object.keys(client.pricebook));
    console.log('Settings services:', Object.keys(client.settings));
    console.log('✅ All services are available');

    // Step 4: Make live API call to get job types
    console.log('\n4. Making live API call to get job types...');
    const jobTypesResponse = await client.jpm.JobTypesService.jobTypesGetList({
      tenant: parseInt(env.servicetitan.tenantId),
      includeTotal: true,
      active: 'True',
      page: 1,
      pageSize: 10
    });

    console.log('✅ Job types API call successful!');
    console.log(`Total job types: ${jobTypesResponse.totalCount || 'N/A'}`);
    console.log(`Returned ${jobTypesResponse.data?.length || 0} job types`);
    
    if (jobTypesResponse.data && jobTypesResponse.data.length > 0) {
      console.log('\nSample job type:');
      const sampleJobType = jobTypesResponse.data[0];
      console.log(`- ID: ${sampleJobType.id}`);
      console.log(`- Name: ${sampleJobType.name}`);
      console.log(`- Active: ${sampleJobType.active}`);
      console.log(`- Business Unit IDs: ${sampleJobType.businessUnitIds?.join(', ') || 'N/A'}`);
    }

    // Step 5: Test auth getter
    console.log('\n5. Testing auth getter...');
    const auth = client.getAuth();
    console.log('Auth object keys:', Object.keys(auth));
    console.log('✅ Auth getter works');

    console.log('\n🎉 All live tests passed! ServiceTitan SDK is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Provide helpful debugging information
    if (error instanceof Error) {
      console.error('\nError details:');
      console.error('- Message:', error.message);
      
      // Check if it's an axios error
      if ('response' in error && error.response) {
        const response = error.response as any;
        console.error('- Status:', response.status);
        console.error('- Status Text:', response.statusText);
        console.error('- Response Data:', JSON.stringify(response.data, null, 2));
      }
    }
    
    process.exit(1);
  }
}

testServiceTitanSDK().catch(console.error); 