<?php

//Change this to your email
$to_myemail = 'test@email.com';


function my_set_error($json, $msg_desc, $field = null, $field_msg = null)
{
  $json['status'] = 'error';
  $json['status_desc'] = $msg_desc;
  if(!empty($field)){
    $json['error_msg'][$field] = $field_msg;
  }
  return $json;
}

function my_validation($json, $from, $phone, $message)
{
  $msg_desc = "Invalid Input!";
  if (empty($from)) {
    $json = my_set_error($json, $msg_desc, 'f_email', 'This is required!');
  } elseif (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
    $json = my_set_error($json, $msg_desc, 'f_email', 'Invalid email format!');
  }
  if (empty($phone)) {
    $json = my_set_error($json, $msg_desc, 'f_phone', 'This is required!');
  }
  if (empty($message)) {
    $json = my_set_error($json, $msg_desc, 'f_message', 'This is required!');
  }
  return $json;
}




$json = array(
  'status' => "success",
  'status_desc' => 'Thanks! Your message has been sent!',
  'error_msg' => array(
    'f_email' => '',
    'f_phone' => '',
    'f_message' => '',
  )
);

$from     = !empty($_POST['f_email']) ?  $_POST['f_email'] : '';
$phone    = !empty($_POST['f_phone']) ?  $_POST['f_phone'] : '';
$message  = !empty($_POST['f_message']) ? $_POST['f_message'] : '';
$subject  = !empty($_POST['f_subject']) ? $_POST['f_subject'] : 'General';

$json = my_validation($json, $from, $phone, $message);

$message = 'Email: '.$from . ', Phone: '.$phone.', Message: ' . $message;
$headers = 'Reply-To: '.$from;  

if ($json['status']  === 'success') {  
  if (!@mail($to_myemail, $subject, $message,  $headers)) {
    $m_err = error_get_last()['message'];  
    $json = my_set_error($json, 'Unable to send Email! '.$m_err);
  }  
}

echo json_encode($json);
