// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyB7NziL8iza-SRgQDpFV86Ud0GxGwxhM2U",
    authDomain: "nina-20725.firebaseapp.com",
    databaseURL: "https://nina-20725.firebaseio.com/",
    projectId: "nina-20725",
    storageBucket: "gs://nina-20725.appspot.com/",
    messagingSenderId: "959133269945"
});

$(document).ready(function () {
    var ref = firebase.database().ref("permanencias");
    var trHTML = '';
    ref.once("value").then(function (snapshot) {
        jQuery.each(snapshot.val(), function (data, permPerson) {
            //console.log(data)
            //console.log(permPerson)
            jQuery.each(permPerson, function (ra, permanencias) {
                //console.log(ra)
                //console.log(permanencias)
                jQuery.each(permanencias, function (i, perm) {
                    console.log(data.replace(/-/gi, "/"))
                    if (perm.finalizado) {
                        trHTML += '<tr><td>' + ra + '</td><td>' + perm.nome + '</td><td>' + data.replace(/-/gi, "/") + '</td><td>' + perm.horainicio + '</td><td>' + perm.horatermino + '</td><td>' + perm.horastotais + '</td></tr>';
                    } else {
                        trHTML += '<tr><td>' + ra + '</td><td>' + perm.nome + '</td><td>' + data.replace(/-/gi, "/") + '</td><td>' + perm.horainicio + '</td><td>-</td><td>-</td></tr>';
                    }

                });

            });
        });
    }).then(function () {
        $('#table-body').empty().append(trHTML);
        $('#example').DataTable({
            columnDefs: [{
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
            }]
        });
        $(".se-pre-con").fadeOut("slow");;
        $("input.form-control.input-sm ").addClass('effect-1')
    })
});