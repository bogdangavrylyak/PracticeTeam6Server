variable "profile1" {
  type    = string
  default = "terraformFullUser1"
}

variable "region-main" {
  type    = string
  default = "eu-central-1"
}

variable "name" {
  type        = string
  description = "Full project name"
}

variable "private_key_path" {
  type        = string
  description = "EC2 instance type"
}

variable "tags" {
  type        = map
  description = "Resource tags"
  default     = {}
}
