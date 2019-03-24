resource "aws_lambda_permission" "allow_lex" {
  statement_id  = "AllowExecutionFromLex"
  action        = "lambda:InvokeFunction"
  function_name = "fpw-chatbot-lex-handler"
  principal     = "lex.amazonaws.com"
  source_arn    = "arn:aws:lex:us-east-1:478543871670:intent:TEST_Hello:*"
}

