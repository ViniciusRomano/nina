<?php 

    $array = array(
        'apiKey'=> getenv('apiKey'),
        'authDomain'=> getenv('authDomain'),
        'databaseURL'=> getenv('databaseURL'),
        'projectId'=> getenv('projectId'),
        'storageBucket'=> getenv('storageBucket'),
        'messagingSenderId'=> getenv('messagingSenderId')
    );
    
  // array_values() removes the original keys and replaces
  // with plain consecutive numbers
  $out = array_values($array);
  echo json_encode($out);
?>
