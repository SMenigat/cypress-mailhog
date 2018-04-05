<?php
namespace Lib;

use PHPMailer\PHPMailer\PHPMailer;

class Mails {
  
  /**
   * Creates a mail object with basic connection settings set
   *
   * @return PHPMailer
   */
  private function createMail() {
    $mail = new PHPMailer(true);   
    $mail->SMTPDebug = 2;
    $mail->isSMTP();
    $mail->Host = 'mailcatcher'; 
    $mail->SMTPAuth = false;
    $mail->Port = 1025;
    return $mail;        
  }

  /**
   * Sends a single name with given subject
   *
   * @param string $subject
   * @return void
   */
  public function sendSingle($subject = 'Single Mail') {

    // create with some basic metadata
    $mail = $this->createMail();
    $mail->setFrom('single@example.com', 'Single');
    $mail->addAddress('recipient@example.net', 'Recipient');

    //Content
    $mail->isHTML(true);                                  // Set email format to HTML
    $mail->Subject = $subject;
    $mail->Body    = 'This is the HTML message body <b>in bold!</b>';

    $mail->send();
  }

  /**
   * Sends given ammount of mails
   *
   * @param integer $ammount
   * @return void
   */
  public function sendBulk($ammount = 10) {
    for($i = 1; $i <= $ammount; $i++) {
      $this->sendSingle("Bulk Mail ${i}/${ammount}");
    }
  }
}