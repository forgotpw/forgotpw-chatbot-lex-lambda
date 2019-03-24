resource "aws_lex_bot" "forgotpw" {
  abort_statement {
    message {
      content_type = "PlainText"
      content      = "Sorry, I am not able to assist at this time"
    }
  }

  child_directed = false

  clarification_prompt {
    max_attempts = 2

    message {
      content_type = "PlainText"
      content      = "I didn't understand you, what would you like to do?"
    }
  }

  # description                 = "Bot to order flowers on the behalf of a user"
  idle_session_ttl_in_seconds = 600

  intent {
    intent_name    = "${aws_lex_intent.hello.name}"
    intent_version = "${aws_lex_intent.hello.version}"
  }

  locale           = "en-US"
  name             = "ForgotPW"
  process_behavior = "BUILD"
  voice_id         = "Salli"
}
