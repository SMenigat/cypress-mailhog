<?php

include_once __DIR__ . '/vendor/autoload.php';

if ($_POST['action']) {
  $mailer = new Lib\Mails();
  switch ($_POST['action']) {
    case 'generate-single':
      $mailer->sendSingle();
      break;
    case 'generate-single-with-attachment':
      $mailer->sendSingleWithAttachment();
      break;
    case 'generate-bulk':
      $mailer->sendBulk();
      break;
    case 'generate-bulk-unique':
      $mailer->sendBulk(10, true);
      break;
  }
} else {
}
