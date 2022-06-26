provider "aws" {
  profile = var.profile1
  region  = var.region-main
}

module "ec2" {
  source = "../modules/ec2"
  name = var.name
  private_key_path = var.private_key_path
  tags = var.tags
}
