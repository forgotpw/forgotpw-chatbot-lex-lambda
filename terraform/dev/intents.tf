resource "aws_lex_intent" "hello" {
  name = "TEST_Hello"

  sample_utterances = [
    "Hi",
    "Hello",
  ]

  fulfillment_activity {
    type = "CodeHook"
    code_hook {
        message_version = "1"
        #uri = "arn:aws:lambda:${var.region}:${var.aws_account_id}:function:fpw-chatbot-lex-handler:$$LATEST"
        uri = "arn:aws:lambda:${var.region}:${var.aws_account_id}:function:fpw-chatbot-lex-handler"
    }
  }

}