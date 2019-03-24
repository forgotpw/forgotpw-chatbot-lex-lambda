# Notes on using Terraform with AWS Lex

## Status

I was not able to get this working with the jzbruno add_aws_lex PR resources.  Below and included here is what I tried.

## Notes

As of March 2019, the pull request for AWS Lex support has not yet been merged to the Terraform AWS Provider.

So until this PR is merged:
https://github.com/terraform-providers/terraform-provider-aws/pull/2616

You have to build the provider with the aws_lex resources yourself:
https://github.com/jzbruno/terraform-provider-aws/tree/add_aws_lex_resources

Some example usage:
https://github.com/jzbruno/terraform-aws-lex-examples

These examples aren't complete, for several things you need to dig into his source code, for example:
https://github.com/jzbruno/terraform-provider-aws/blob/add_aws_lex_resources/aws/resource_aws_lex.go
