// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyB7NziL8iza-SRgQDpFV86Ud0GxGwxhM2U",
    authDomain: "nina-20725.firebaseapp.com",
    databaseURL: "https://nina-20725.firebaseio.com/",
    projectId: "nina-20725",
    storageBucket: "gs://nina-20725.appspot.com/",
    messagingSenderId: "959133269945"
});
var inicialSettings = {
    init: function () {
        inicialSettings.populateTable();
        inicialSettings.searchEvent();
        inicialSettings.reloadTable();

    },
    populateTable: function () {
        var ref = firebase.database().ref("permanencias");
        var trHTML = '';
        ref.once("value").then(function (snapshot) {
            jQuery.each(snapshot.val(), function (data, permPerson) {
                jQuery.each(permPerson, function (ra, permanencias) {
                    jQuery.each(permanencias, function (i, perm) {
                        console.log(data.replace(/-/gi, "/"))
                        if (perm.finalizado) {
                            trHTML += '<tr><td>' + ra + '</td><td>' + perm.nome + '</td><td>' + data.replace(/-/gi, "/") + '</td><td>' + perm.horainicio + '</td><td>' + perm.horatermino + '</td><td class="horastotais">' + perm.horastotais + '</td></tr>';
                        } else {
                            trHTML += '<tr><td>' + ra + '</td><td>' + perm.nome + '</td><td>' + data.replace(/-/gi, "/") + '</td><td>' + perm.horainicio + '</td><td>-</td><td>-</td></tr>';
                        }

                    });

                });
            });
        }).then(function () {
            $('#table-body').empty().append(trHTML);
            $('#example').DataTable({
                responsive: true,
                columnDefs: [{
                    targets: [0, 1, 2],
                    className: 'mdl-data-table__cell--non-numeric'
                }]
            });
            $(".se-pre-con").fadeOut("slow");
            $("input.form-control.input-sm").addClass('effect-1');
            inicialSettings.searchEvent();
            inicialSettings.reloadTable();
        })
    },
    searchEvent: function () {
        $('input.form-control.input-sm').on('input', function () {
            inicialSettings.reloadTable();
        });
    },
    reloadTable: function () {
        var hora = 0;
        var min = 0;
        $('.horastotais').each(function () {
            var split = $(this).text().split(':')
            hora += parseFloat(split[0]);
            min += parseFloat(split[1]);
        });
        hora += parseInt(min / 60);
        min = min % 60
        console.log(hora, min)
        $('#somatotal').text(hora + ":" + min)
    },
};
$(document).ready(function () {
    inicialSettings.init();
});