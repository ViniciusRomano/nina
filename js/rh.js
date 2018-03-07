// Initialize Firebase
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
        $('#somatotal').text(("0" + hora).substr(-2) + ":" + ("0" + min).substr(-2))
    },
};
$(document).ready(function () {
    $.get("../firebase.php", function (data) {
        data = JSON.parse("[" + data + "]");
        data = data[0]
        var config = {
            apiKey: data[0],
            authDomain: data[1],
            databaseURL: data[2],
            projectId: data[3],
            storageBucket: data[4],
            messagingSenderId: data[5]
        }
        firebase.initializeApp(config);
    }).done(function (data) {
        inicialSettings.init();
    })
});