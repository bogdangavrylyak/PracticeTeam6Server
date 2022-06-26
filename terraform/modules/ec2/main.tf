data "aws_ami" "latest_amazon_linux_2" {
  owners      = ["137112412989"]
  most_recent = true
  filter {
    name  = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_eip" "ec2" {
  instance = aws_instance.my_webserver.id
  vpc      = true
  tags     = var.tags
}

resource "aws_instance" "my_webserver" {
  ami                    = data.aws_ami.latest_amazon_linux_2.id 
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.my_webserver_security_group.id]
  key_name= "ubuntu1-ssh-keypair"
  tags = merge({
    Name = var.name
    },
    var.tags
  )
}

resource "aws_security_group" "my_webserver_security_group" {
  name        = "Practice Team6 WebServer Security Group"

  dynamic "ingress" {
    for_each = var.ingress_ports
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

  tags = merge({
    Name = var.name
    },
    var.tags
  )
}