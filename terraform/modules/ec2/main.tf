data "aws_availability_zones" "available" {}

data "aws_ami" "latest_amazon_linux" {
  owners      = ["amazon"]
  most_recent = true
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "my_webserver" {
  ami                    = "ami-05d34d340fb1d89e5" # amazon_linux ami
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.my_webserver_security_group.id]
  tags = {
    Name    = "Practice Team6 WebServer With Amazon Linux 2"
    Owner   = "Bodya"
    Project = "Practice Team6 Server"
  }
}

resource "aws_security_group" "my_webserver_security_group" {
  name        = "Practice Team6 WebServer Security Group"
  #   vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = ["80", "443", "4000"]
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name  = "WebServer Security Group"
    Owner = "Bodya"
  }
}