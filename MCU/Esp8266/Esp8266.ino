#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
//WIFI
const char *ssid = "Redmi K40";
const char *password = "btx2000113";
//MQTT Broker
const char *mqtt_broker = "mqtt.xiaobai1103.cn";
const char *topic_pub = "classroom_101";
const char *topic_sub = "miniprogram_101";//订阅101教室的
const char *mqtt_username = "emqx";
const char *mqtt_password = "public";
const int mqtt_port = 1883;
//软串口
SoftwareSerial serial_arduino(D7,D8);//RX,TX
String UART_String="";//软串口缓存
String miniprogram_received="";//接收数据缓存
//创建连接对象
WiFiClient espClient;
PubSubClient client(espClient);
/*
        初始化
*/
void setup() {

    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.println("Connecting to WiFi..");
    }
    serial_arduino.begin(9600);
    serial_arduino.listen();
    Serial.println("Connected to the WiFi network");
    //connecting to a mqtt broker
    client.setServer(mqtt_broker, mqtt_port);
    client.setCallback(callback);
    while (!client.connected()) {
        String client_id = "esp8266-client-";
        client_id += String(WiFi.macAddress());
        Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
        if (client.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
            Serial.println("Public emqx mqtt broker connected");
        } else {
            Serial.print("failed with state ");
            Serial.print(client.state());
            delay(2000);
        }
    }
    // publish and subscribe
    client.publish(topic_pub, "hello emqx");
    client.subscribe(topic_sub);
}
/*
        MQTT消息接收
*/
void callback(char *topic_pub, byte *payload, unsigned int length) {
    Serial.print("Message arrived in topic: ");
    Serial.println(topic_pub);
    Serial.print("Message:");
    for (int i = 0; i < length; i++) {
      miniprogram_received += (char) payload[i];
    }
      serial_arduino.print(miniprogram_received);
      Serial.print(miniprogram_received);
      miniprogram_received="";
      Serial.println();
      Serial.println("-----------------------");
}

/*
        数据上报
*/
void mqttPub()
{
  char msg[100];
  const char *buff = UART_String.c_str();//string类型要转化为c字符串下的字符串类型才行，而且string 类型是常量字符串，所以要name2是const类型
  sprintf(msg,"%s",buff);
  client.publish(topic_pub, msg);
  Serial.print("数据上报:");
  Serial.print(msg);
  Serial.print("\n");
  UART_String=""; //清空缓存

}

void loop() {
    if(serial_arduino.available()>0)
  {
    if(serial_arduino.peek()!='\n')//以换行符结束接收过程
    {
      UART_String+=(char)serial_arduino.read();
    }
    else
    {
      serial_arduino.read();
      Serial.print("serial_arduino data:");
      Serial.println(UART_String);
      mqttPub();
       }
  }
 client.loop();   
    }

