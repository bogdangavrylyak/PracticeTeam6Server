variable "profile1" {
  type    = string
  default = "terraformFullUser1"
}

variable "region-main" {
  type    = string
  default = "eu-central-1"
}

provider "aws" {
  profile = var.profile1
  region  = var.region-main
}
