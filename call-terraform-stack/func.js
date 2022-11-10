const fdk = require('@fnproject/fdk');
const common = require('oci-common');
const orm = require('oci-resourcemanager');
const util = require('./util.js');

const STACK_ID = 'ocid1.ormstack.oc1.iad.amaaaaaa2ocwscaa5fdc5zjyeriepmxzcwvpohyysfl4q4kp3kki2kffdjuq';

fdk.handle(async function(input, context) {

    try {
        let stackId;

        //** grab the stack from the input if present
        if(input && input.stack)
            stackId = input.stack;

        await util.log('begin, using stack:'+ stackId || 'none given');

        //** create our resource principal provider and signer
        const provider = common.ResourcePrincipalAuthenticationDetailsProvider.builder();
        const signer = new common.DefaultRequestSigner(provider);

        //** create a resource manager client with our resource principal
        const client = new orm.ResourceManagerClient({
            authenticationDetailsProvider: provider
        });

        util.log('getting list of stacks');

        //** get the stack we want to run
        const stacks = await client.listStacks({
            id: STACK_ID
        });

        util.log('received');

        if(!stacks || stacks.items.length == 0)
            return error(context, 500, 'No stacks retrieved');

        util.log(stacks.items);

        //** create a job for running the stack
        const res = await client.createJob({ 
            createJobDetails: {
                applyJobPlanResolution: {},
                stackId: stackId || STACK_ID,
                operation: 'PLAN'
            }
        });

        return { message: res.value }

    } catch(e) {
        return error(context, 500, 'Search type unknown');
    }

})

async function error(context, code, message) {
    if (context.httpGateway)
        context.httpGateway.statusCode = code||500;

    await util.log('error:'+ message);
    return { error: message || 'An error has occurred' };
}


