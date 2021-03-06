<?php
header('Access-Control-Allow-Origin: *');

require_once('../config/database.php');

$db = new Database();
$loginInfo = array();
function generateSalt($max = 64) {
	$characterList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";
	$i = 0;
	$salt = "";
	while ($i < $max) {
	    $salt .= $characterList{mt_rand(0, (strlen($characterList) - 1))};
	    $i++;
	}
	return $salt;
}

$data = file_get_contents("php://input");
parse_str($data,$formData);

$user = trim($formData['username']);
$user = strip_tags($user);
$pass = trim($formData['password']);
$pass = strip_tags($pass);

$select_user_sql = "SELECT * from userInfo where USERNAME = '$user'";

$select_user_result = $db-> executeQuery($select_user_sql);
if($select_user_result-> num_rows > 0){

	$row= $select_user_result->fetch_assoc();
	json_encode($row);
	$stored_salt = $row['SALT'];
	$stored_hash = $row['PASSWORD'];
	$is_approved = $row['isApproved'];
	$check_pass = $stored_salt . $pass;
	$check_hash = hash('sha512',$check_pass);
	if($check_hash == $stored_hash && $is_approved === 'F'){
		$msg = " Not approved yet! \n Please wait until you get a confirmation email before logging in";
		$login = false;
	}
	else if($check_hash == $stored_hash && $is_approved === 'T'){
	        $msg= "User authenticated";
	        $login = true;
	        $isAdmin = ($row['isAdmin']==='F') ? false : true ;
	        $isApproved = ($row['isApproved']==='F') ? false : true ;
	        $userInfo = array(
							'username' => $row['USERNAME'],
							'fname' => $row['FirstName'],
							'lname' => $row['LastName'],
							'isAdmin' => $isAdmin,
							'isApproved' => $isApproved
						);
	        $loginInfo['userInfo']= $userInfo;
	}
	else{
	        $msg= "Not authenticated: Please Enter the right Username and Password";
	        $login =false;
	}
}
else{
	$msg= "Not authenticated: Please Enter the right Username and Password";
	$login = false;
} 

/* Load the login info status to send back response */

$loginInfo['msg']= $msg;
$loginInfo['status'] = $login;
echo json_encode($loginInfo);
$db->closeConnection();
?>