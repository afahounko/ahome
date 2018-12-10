export default ['i18n', function(i18n) {
    return {
    	name: 'multiselectLists',
		basePath: 'hosts',
    	iterator: 'multiselect',
		editTitle: i18n._('MULTIPLE SELECT'),
        listTitle: i18n._('MULTIPLE SELECT'),
        emptyListText: i18n._('THERE ARE CURRENTLY NO ITEMS TO SELECT'),
        index: false,
        listTitle: false,
		well: false,
        hover: false,
		multiSelect: true,
        fields: {
            name: {
                key: true,
                label: i18n._('Name'),
                columnClass: 'col-md-11 col-sm-11 col-xs-11',
                modalColumnClass: 'col-md-8',
                //uiSref: 'instanceGroups.instances.list({instance_group_id: instance_group.id})',
                ngClass: "{'isActive' : isActive()}"
            },
        }
    };
}];
