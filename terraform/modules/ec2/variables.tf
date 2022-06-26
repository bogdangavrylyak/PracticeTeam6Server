variable "name" {
  type        = string
  description = "Full project name"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t2.micro"
}

variable "private_key_path" {
  type        = string
  description = "EC2 instance type"
}

variable "ec2_user" {
  type        = string
  description = "EC2 instance user"
  default = "ec2-user"
}

variable "connection_type" {
  type        = string
  description = "Connection Type for EC2 instance"
  default = "ssh"
}

variable "connection_timeout" {
  type        = string
  description = "Connection Timeout for EC2 instance"
  default = "4m"
}

variable "ingress_ports" {
  type        = list
  description = "Ingress Ports for EC2 Security Group"
  default = ["80", "443", "4000", "22"]
}

variable "tags" {
  type        = map
  description = "Resource tags"
  default     = {}
}
