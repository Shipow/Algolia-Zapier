var Zap = {
   update_pre_write: function(bundle) {

       var myRecord = {};
       var data = bundle.action_fields_full.record;

       Object.keys(data).forEach(function(key,index) {
          if (data[key]*1) {
              data[key] = data[key]*1;
          }
          myRecord[key] = data[key];
       });


    myRecord = JSON.stringify(myRecord);

        return {
          url: bundle.request.url,
          method: bundle.request.method,
          auth: bundle.request.auth,
          headers: bundle.request.headers,
          params: bundle.request.params,
          data: myRecord

        };
    }
};
