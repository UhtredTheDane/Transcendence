FROM python:3.10.1-alpine

# Update the package repository and install Nginx and OpenSSL
RUN apk update && apk add --no-cache \
    nginx \
    openssl
RUN mkdir -p /etc/nginx/ssl/
RUN mkdir -p /etc/nginx/conf.d/


RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/nginx.key \
        -out /etc/nginx/ssl/nginx.crt \
        -subj "/CN=transcendence.local/O=Transcendence/C=FR"

# Copy the updated Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Expose port 443 for HTTPS traffic
EXPOSE 443
EXPOSE 8443


# Run Nginx in the foreground
CMD [ "nginx", "-g", "daemon off;" ]