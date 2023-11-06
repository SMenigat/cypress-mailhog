<?php

namespace Lib;

use PHPMailer\PHPMailer\PHPMailer;

class Mails
{

  /**
   * Creates a mail object with basic connection settings set
   * 
   * @param string $from
   * @param string $recipient
   *
   * @return PHPMailer
   */
  private function createMail($from = 'single@example.com', $recipient = 'recipient@example.com')
  {
    $mail = new PHPMailer(true);
    $mail->SMTPDebug = 2;
    $mail->isSMTP();
    $mail->Host = 'mailhog';
    $mail->SMTPAuth = false;
    $mail->Port = 1025;

    // create with some basic metadata
    $mail->setFrom($from, 'Single');
    $mail->addAddress($recipient, 'Recipient');
    $mail->addCC('cc-recipient@example.com');
    $mail->addBCC('bcc-recipient@example.com');

    //Content
    $mail->isHTML(true);                                  // Set email format to HTML
    $mail->Subject = 'Demo Subject';
    $mail->Body    = 'This is the HTML message body <b>in bold!</b>';

    return $mail;
  }

  /**
   * Sends a single name with given subject
   *
   * @param string $subject
   * @param string $from
   * @param string $recipient
   * @return void
   */
  public function sendSingle($subject = 'Single Mail', $from = 'single@example.com', $recipient = 'recipient@example.com')
  {
    $mail = $this->createMail($from, $recipient);                              // Set email format to HTML
    $mail->Subject = $subject;
    $mail->send();
  }

  public function sendSingleWithAttachment()
  {
    $mail = $this->createMail();
    $mail->Subject = 'Mail with Attachment';
    $mail->addAttachment(__DIR__ . '/../attachment.txt');
    $mail->addAttachment(__DIR__ . '/../sample.pdf');
    $mail->send();
  }

  /**
   * Sends given amount of mails
   *
   * @param integer $amount
   * @param boolean $uniqueSenders
   * @return void
   */
  public function sendBulk($amount = 10, $uniqueSenders = false)
  {
    for ($i = 1; $i <= $amount; $i++) {
      if ($uniqueSenders) {
        $this->sendSingle("Unique Mail ${i}/${amount}", "single-${i}@example.com", "recipient-${i}@example.com");
      } else {
        $this->sendSingle("Bulk Mail ${i}/${amount}");
      }
    }
  }
}
