window.boardViewExtender = {};

window.boardViewExtender.styleCallback = function(context) {
    const data = context.data;

    return { borderRight: "3px solid green" };
};

window.boardViewExtender.onStateTransition = function(context) {
    if (![5, 1000].includes(context.target.Value)) {
        return;
    }
    
    return context.showForm({
        title: "Resolve case",
        fields: {
            "subject": {
                label: "Subject",
                type: "text",
                required: true,
                subtext: "Please enter a summary how the case was solved"
            },
            "timespent": {
                label: "Time spent",
                type: "number",
                required: true,
                subtext: "How long did it take you to solve this case (in minutes)?"                
            },
            "description": {
                label: "Description",
                type: "text",
                as: "textarea",
                rows: 5,
                required: true,
                subtext: "Please describe how the case was solved"
            }/*,
            "contact": {
                label: "Contact",
                type: "lookup",
                required: true,
                subtext: "This is only for showcasing that lookups are supported as well",
                fetchXml: '<fetch><entity name="contact"><attribute name="fullname" /><attribute name="emailaddress1" /><attribute name="gendercode" /> <attribute name="parentcustomerid" /><order attribute="fullname" /></entity></fetch>',
                secondaryFields: ["emailaddress1", "gendercode", "parentcustomerid"],
                displayField: "fullname"
            }*/
        }
    })
    .then(formResult => {
        if (!formResult.cancelled) {
            context.setWorkIndicator(true);

            const closeRequest = context.WebApiClient.Requests.CloseIncidentRequest.with({
                payload: {
                    IncidentResolution: {
                        "incidentid@odata.bind": `/incidents(${context.data.incidentid})`,
                        subject: formResult.values.subject,
                        timespent: formResult.values.timespent,
                        description: formResult.values.description
                    },
                    Status: context.target.Value
                }
            });

            return context.WebApiClient.Execute(closeRequest)
            .then(() => {
                context.setWorkIndicator(false);
                return context.refresh()
            })
            .then(() => {
                return { preventDefault: true };
            })
            .catch(e => Xrm.Utility.alertDialog(e.message || e, () => {}));
        }

        return { preventDefault: true };
    });
};

window.boardViewExtender.onPrimaryClick = function (context) {
    alert("Primary button clicked");
};

window.boardViewExtender.onSecondaryClick = function (context) {
    alert("Secondary button clicked");
};