// Quick test script to simulate a POST to api/submit.js
// It overrides the real save function to avoid touching Firestore.

const path = require('path');
const servicesPath = path.join(__dirname, '..', 'server', 'services', 'teamRegistrations.js');
const apiPath = path.join(__dirname, '..', 'api', 'submit.js');

(async () => {
  try {
    // Load the service module and replace saveTeamRegistration with a fake
    const teamSvc = require(servicesPath);

    // Replace saveTeamRegistration to avoid Firestore calls
    teamSvc.saveTeamRegistration = async (data) => {
      console.log('\n[FAKE SAVE] Team registration payload received by fake saveTeamRegistration:');
      console.log(JSON.stringify(data, null, 2));
      // simulate async write
      return Promise.resolve({ id: 'fake-id-123' });
    };

    // Now require the API handler (it will use the modified service)
    const apiHandler = require(apiPath);

    // Build a valid payload matching validation rules (team size 3 => leader + 2 members)
    const payload = {
      teamName: 'Testers United',
      teamSize: '3',
      lead: {
        name: 'Alex Lead',
        email: 'alex.lead@example.edu',
        gender: 'female'
      },
      members: [
        { name: 'Member One', email: 'm1@example.edu', gender: 'male' },
        { name: 'Member Two', email: 'm2@example.edu', gender: 'female' }
      ],
    };

    // Mock request and response objects
    const req = {
      method: 'POST',
      body: payload,
    };

    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(k, v) {
        this.headers[k] = v;
      },
      json(obj) {
        console.log('\n[HANDLER RESPONSE] status=%s body=%s', this.statusCode, JSON.stringify(obj));
      }
    };

    // Invoke handler
    await apiHandler(req, res);

  } catch (err) {
    console.error('Test harness error:', err);
    process.exit(1);
  }
})();
