export default ['Rest', 'GetBasePath', 'ProcessErrors',
function(Rest, GetBasePath, ProcessErrors) {
    return function(params = null) {
        Rest.setUrl(GetBasePath('credential_types'));
        return Rest.get({ params })
            .then(({data}) => {
                var val = {};
                data.results.forEach(type => {
                    val[type.name] = type.id;
                });
                console.log(val);
                return val;
            })
            .catch(({data, status}) => {
                ProcessErrors(null, data, status, null, {
                    hdr: 'Error!',
                    msg: 'Failed to GET credential types.  Returned status' +
                        status
                });
            });
    };
}];
