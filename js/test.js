// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyB7NziL8iza-SRgQDpFV86Ud0GxGwxhM2U",
  authDomain: "nina-20725.firebaseapp.com",
  databaseURL: "https://nina-20725.firebaseio.com/",
  projectId: "nina-20725",
  storageBucket: "gs://nina-20725.appspot.com/",
  messagingSenderId: "959133269945"
});

var statusConnection = true;
var date;
var inicialSettings = {
  init: function () {
    inicialSettings.checkConnection();
    inicialSettings.loadData();
    inicialSettings.loadButton();
    inicialSettings.onUpdate();
    inicialSettings.sortTable();
  },
  sortTable: function () {
    $(".responsive-table").stupidtable();
  },
  checkConnection: function () {
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function (snap) {
      if (snap.val() === true) {
        statusConnection = true;
        $('#connection-circle').css({
          fill: "#00ff00"
        });
      } else {
        statusConnection = false;
        $('#connection-circle').css({
          fill: "e32929"
        });
      }
    });
  },
  insert: function (date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = "0" + date.getMinutes();
    var formattedDate = day + "-" + month + "-" + year;
    var formattedTime = hour + ":" + min.substr(-2);
    var ra = document.getElementById("ra").value;
    var indice = 0;
    var ref = firebase.database().ref("pessoas/" + ra);
    ref.once("value").then(function (snapshot) {
      if (snapshot.exists()) {
        var nome = snapshot.val();
        var ref = firebase.database().ref("permanencias/" + formattedDate);
        ref.once("value").then(function (snapshot) {
          if (snapshot.exists()) {
            while (snapshot.child(ra + "/" + indice + "/finalizado").val()) {
              indice++;
            }
            if (snapshot.child(ra + "/" + indice).exists()) {
              var inicio = snapshot.child(ra + "/" + indice + "/horainicio").val();
              var inicioHour = parseInt(inicio.substr(0, 2));
              var inicioMin = parseInt(inicio.substr(3, 5));
              var formattedHour = parseInt(formattedTime.substr(0, 2));
              var formattedMin = parseInt(formattedTime.substr(3, 5));
              var horasT = ("0" + (formattedHour - inicioHour)).substr(-2) + ":" + ("0" + (formattedMin - inicioMin)).substr(-2);
              ref.child(ra + "/" + indice).update({
                "horatermino": formattedTime,
                "horastotais": horasT,
                "finalizado": true
              });
              swal({
                position: 'center',
                type: 'success',
                title: 'Permanência fechada com sucesso!',
                showConfirmButton: false,
                timer: 2200
              });

            } else {
              ref.child(ra + "/" + indice).set({
                "nome": nome,
                "horainicio": formattedTime,
                "horatermino": null,
                "horastotais": null,
                "finalizado": false,
                "teste": firebase.database.ServerValue.TIMESTAMP
              });
              swal({
                position: 'center',
                type: 'success',
                title: 'Permanência aberta com sucesso!',
                showConfirmButton: false,
                timer: 2200
              });
            }
          } else {
            ref.child(ra + "/0").set({
              "nome": nome,
              "horainicio": formattedTime,
              "horatermino": null,
              "horastotais": null,
              "finalizado": false
            });
            swal({
              position: 'center',
              type: 'success',
              title: 'Entrada na permanência realizada com sucesso!',
              showConfirmButton: false,
              timer: 2200
            });
          }
        }).
        catch(function (error) {
          swal(
            'Conexão não efetuada',
            'As configurações do banco provavelmente não estão corretas. Informe à algum responsável na diretoria de projetos.',
            'question'
          )
        });
      } else {
        swal({
          type: 'error',
          title: 'RA não cadastrado!',
          text: 'Este RA não é de um membro da Unect Jr.',
          footer: 'Caso necessário, entre em contato com a diretoria de projetos.',
        });
      }
    });
  },
  loadButton: function () {
    $("#submit-button").on('click', function () {
      //console.log(data.zones[0].timestamp)
      //console.log(new Date(data.zones[0].timestamp * 1000))
      var ra = document.getElementById("ra").value;
      if (ra == '') {
        swal({
          type: 'error',
          title: 'RA não cadastrado!',
          text: 'Este RA não é de um membro da Unect Jr.',
          footer: 'Caso necessário, entre em contato com a diretoria de projetos.',
        });
      } else if (!statusConnection) {
        swal(
          'Problemas com a conexão!',
          'Tente reconectar a internet. Assim que a conexão voltar, espere alguns segundos que a permanência será realizada automaticamente.',
          'question'
        );
      } else {
        swal.showLoading();
        $.ajax({
          url: 'https://api.timezonedb.com/v2/list-time-zone?key=HXBDPTD39IGR&format=json&country=BR&zone=America/Sao_Paulo',
          timeout: 3000, //3 second timeout
          type: 'GET',
          success: function (data) {
            date = new Date((data.zones[0].timestamp - data.zones[0].gmtOffset) * 1000);
            //var date = new Date(+Date.now());
            inicialSettings.insert(date);
            console.log('api')
          }
        }).fail(function (jqXHR, textStatus) {
          if (textStatus === 'timeout') {
            date = new Date(+Date.now());
            inicialSettings.insert(date);
            console.log('fapi')
          }
        }).done(function () {
          date = new Date(+Date.now());
          inicialSettings.insert(date);
          console.log('dapi')
        })
      }
    });
  },
  loadData: function () {
    var date = new Date(+Date.now());
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var formattedDate = day + "-" + month + "-" + year;
    var ref = firebase.database().ref("permanencias/" + formattedDate).orderByChild('horainicio');
    ref.once("value").then(function (snapshot) {
      var trHTML = '';
      jQuery.each(snapshot.val(), function (ra, permanencias) {
        jQuery.each(permanencias, function (i, perm) {
          if (perm.finalizado) {
            trHTML += '<tr><td>' + perm.nome + '</td><td>' + perm.horainicio + '</td><td>' + perm.horatermino + '</td><td>' + perm.horastotais + '</td><td><img class="finalizado" id="final-tabela" src="../img/true.png" alt=""></td></td></tr>';
          } else {
            trHTML += '<tr><td>' + perm.nome + '</td><td>' + perm.horainicio + '</td><td>-</td><td>-</td><td><img class="finalizado" id="final-tabela" src="../img/false.png" alt=""></td></tr>';
          }
        });
      });
      $('#table-body').empty().append(trHTML);
    });
  },
  onUpdate: function () {
    var ref = firebase.database().ref("permanencias");
    ref.on("child_changed", function (snapshot) {
      inicialSettings.loadData();
    });
    ref.on("child_added", function (snapshot) {
      inicialSettings.loadData();
    });
  }
};

$(document).ready(function () {
  inicialSettings.init();
});