// Initialize Firebase
var disableGps = false;
var statusGps = false;
var statusPosition;
var statusConnection = true;
var date;

var inicialSettings = {
  init: function () {
    inicialSettings.getStatusGps();
    inicialSettings.checkConnection();
    inicialSettings.loadData();
    inicialSettings.loadButton();
    inicialSettings.onUpdate();
    inicialSettings.sortTable();
  },
  getStatusGps: function () {
    function checkGpsOn() {
      statusGps = true;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(checkGpsOn);
    } else {
      statusGps = false
      swal('Este Navegador não suporta Geolocalização!')
    }
  },
  checkPosition: function (position) {
    var lat = -23.1871363;
    var long = -50.656422;
    console.log(lat, long)
    var dist = (((position.coords.latitude - lat)) ** 2 + ((position.coords.longitude - long)) ** 2) ** 0.5
    console.log(position.coords.latitude, position.coords.longitude);
    console.log(dist)
    if (0.0007 > dist) {
      statusPosition = true;
    } else {
      statusPosition = false;
    }
  },
  checkLocation: function () {
    if (statusGps) {
      navigator.geolocation.getCurrentPosition(inicialSettings.checkPosition);
    } else {
      swal('Este Navegador não suporta Geolocalização, ou está desativado!')
    }
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
              if ((formattedMin - inicioMin) < 0) {
                var horasT = ("0" + (formattedHour - inicioHour - 1)).substr(-2) + ":" + ("0" + (60 + (formattedMin - inicioMin))).substr(-2);
              } else {
                var horasT = ("0" + (formattedHour - inicioHour)).substr(-2) + ":" + ("0" + (formattedMin - inicioMin)).substr(-2);
              }

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
      //get positions
      navigator.geolocation.getCurrentPosition(inicialSettings.checkPosition);
      var ra = document.getElementById("ra").value;
      // gps working

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
          'Verifique se o dispositivo está conectado a internet',
          'question'
        );
      } else if (!statusGps) {
        swal(
          'Problemas com o GPS!',
          'Ative sua localização de GPS. O Problema pode ser também que seu navegador não suporta geolocalização.',
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
            if (statusPosition || disableGps) {
              inicialSettings.insert(date);
            } else {
              swal({
                type: 'error',
                title: 'Você não está na sala de permanência!',
                text: 'Segundo sua localização, você não se encontra na sala da permanência.',
                footer: 'Caso necessário, entre em contato com a diretoria de projetos.',
              });
            }
            console.log('api')
          }
        }).fail(function (jqXHR, textStatus) {
          if (textStatus === 'timeout') {
            date = new Date(+Date.now());
            if (statusPosition || disableGps) {
              inicialSettings.insert(date);
            } else {
              swal({
                type: 'error',
                title: 'Você não está na sala de permanência!',
                text: 'Segundo sua localização, você não se encontra na sala da permanência.',
                footer: 'Caso necessário, entre em contato com a diretoria de projetos.',
              });
            }
            console.log('fapi')
          }
        }).done(function () {
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

$(window).on('load', function () {
  $(".se-pre-con").fadeOut("slow");
});
//$(".se-pre-con").fadeOut("slow");