FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p instance && chmod +x entrypoint.sh

EXPOSE 5001
ENTRYPOINT ["./entrypoint.sh"]
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5001", "wsgi:app"]
