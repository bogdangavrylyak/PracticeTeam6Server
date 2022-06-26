output "latest_amazon_linux_2_ami_name" {
  value = data.aws_ami.latest_amazon_linux_2.name
}

output "ip" {
  value       = aws_instance.my_webserver.public_ip
  description = "EC2 instance IP address"
}

