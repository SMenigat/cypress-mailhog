<?php

include_once __DIR__ . '/vendor/autoload.php';

if ($_POST['action']) {
  $mailer = new Lib\Mails();
  $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/cypress-mh-tests/';
  switch ($_POST['action']) {
    case 'generate-single':
      $mailer->sendSingle();
      break;
    case 'generate-single-with-attachment':
      $mailer->sendSingleWithAttachment();
      break;
    case 'generate-single-encoded':
      $mailer->sendSingleEncoded();
      break;
    case 'generate-single-with-links':
      $mailer->sendSingleWithLinks($baseUrl);
      break;
    case 'generate-single-text-with-link':
      $mailer->sendSingleTextWithLink($baseUrl);
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
