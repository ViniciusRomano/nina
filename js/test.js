// Initialize Firebase

  var config = {
    apiKey: "AIzaSyCYh4W6UEQrSCmx-RpSznDkxdigTPqSxNs",
    authDomain: "fir-test-cb75a.firebaseapp.com",
    databaseURL: "https://fir-test-cb75a.firebaseio.com",
    projectId: "fir-test-cb75a",
    storageBucket: "fir-test-cb75a.appspot.com",
    messagingSenderId: "1006507312413"
  };

  firebase.initializeApp(config);
  var dbFirebase = firebase.database().ref();

  function writePessoaData(){

    var date = new Date(+Date.now());
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = "0"+date.getMinutes();
    var formattedDate = day + "-" + month + "-" + year;
    var formattedTime = hour + ":" + min.substr(-2);
    var ra = document.getElementById("ra").value;
    var indice = 0;

    var ref = firebase.database().ref("pessoas/"+ra);
    ref.once("value").then(function(snapshot){
      if(snapshot.exists()){
        var nome = snapshot.child("nome").val();
        var ref = firebase.database().ref("permanencias/"+formattedDate);
        ref.once("value").then(function(snapshot){
          if(snapshot.exists()){
            while(snapshot.child(ra+"/"+indice+"/finalizado").val()){
              indice++;
            }
            if(snapshot.child(ra+"/"+indice).exists()){
              var inicio = snapshot.child(ra+"/"+indice+"/horainicio").val();
              var inicioHour = parseInt(inicio.substr(0,2));
              var inicioMin = parseInt(inicio.substr(3,5));
              var formattedHour = parseInt(formattedTime.substr(0,2));
              var formattedMin = parseInt(formattedTime.substr(3,5));
              var horasT = ("0"+(formattedHour-inicioHour)).substr(-2)+":"+("0"+(formattedMin-inicioMin)).substr(-2);
              ref.child(ra+"/"+indice).update({
                "horatermino" : formattedTime,
                "horastotais" : horasT,
                "finalizado" : true
              });

            }else{
              ref.child(ra+"/"+indice).set({
                  "nome" : nome,
                  "horainicio" : formattedTime,
                  "horatermino" : null,
                  "horastotais" : null,
                  "finalizado" : false
              });
            }
          }else{
            ref.child(ra+"/0").set({
              "nome" : nome,
              "horainicio" : formattedTime,
              "horatermino" : null,
              "horastotais" : null,
              "finalizado" : false
            });
          }
        });
      }else{
        alert("Usuário não cadastrado !");
      }
    });
  }
