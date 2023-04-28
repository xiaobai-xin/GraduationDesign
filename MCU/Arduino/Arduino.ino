/*
    date: 20 Apr,2023

*/
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27,16,2); // 创建对象并初始化为 16x2 LCD，I2C地址为0x27
/* 
        定义引脚
            A05 为 SCL
            A04 为 SDL
*/
#define analog_fan A1//风扇pwm
#define analog_light 3//电灯pwm
#define analog_lum 0 //光敏电阻接口
#define body_sensor 4//红外
#define Temp_sensor A3 //温度传感器接口
#define btnNext 2//next按钮
#define btnLight 5//电灯开关按钮
#define btnFan 6//风扇开关按钮
//串口变量
String serial_received;//串口接收缓存
unsigned long previousMillis = 0;
const unsigned long interval = 1000;//串口发送时间间隔
//状态变量
String led_lum = "";
String fan_speed = "";
String isAutoOpen = "";
String isAutoPowerOpen = "";
String isAutoFanOpen = "";
String autoFanValue = "";
String isAutoLedOpen = "";
String autoLedvalue = "";
//教室环境信息
int temp;//温度
int lum;//亮度
//当前控制设定
int fanSpeed;//当前转速
int lightLum;//当前亮度
//LCD1602显示
int showInfor = 0;
//按键变量
volatile uint8_t nextBtnState = LOW;
volatile unsigned long lastTime = 0;
int DEBOUNCE_DELAY=1; //消抖时间
volatile bool nextBtnFlag = false;
void setup() {
  //串口初始化
  Serial.begin(9600);
  //LCD1602初始化
  lcd.init(); 
  lcd.backlight(); 
  //开启硬件中断（下降沿触发）
  attachInterrupt(digitalPinToInterrupt(btnNext), btnNextInterrupt, FALLING);
}

void loop() {
  sensorReading();//读取传感器
  LCD1602();
  unsigned long currentMillis = millis(); // 获取当前毫秒数
  if (currentMillis - previousMillis >= interval) { // 判断是否到达发送时间
    previousMillis = currentMillis; // 更新上一次发送时间
    Txd();//串口发送 // 发送数据
  }
  autoMation();//自动化控制
  Rxd();//串口接收
  btnHandle();//按键处理
}
/*
        按钮处理函数
*/
void btnHandle(){
  //next按钮
  if(nextBtnFlag){
    nextBtnFlag = false;
    if(showInfor)
      showInfor = 0;
    else
      showInfor = 1;    
  }
}
/*
        next按钮中断
*/
void btnNextInterrupt() {
  uint8_t reading = digitalRead(btnNext);
  if (reading != nextBtnState && millis() - lastTime > DEBOUNCE_DELAY) {
    nextBtnState = reading;
    lastTime = millis();
    nextBtnFlag = true;
  }
}

/*
        设置风扇转速
        输入值为0~100 (映射到0~255)
*/
void fanSet(int value){
  fanSpeed = value;
  value = map(value, 0, 100, 0, 255);
  analogWrite(analog_fan, value);
}
/*
        设置亮度
        输入值为0~100 (映射到0~255)
*/
void lightSet(int value){
  lightLum = value;
  value = map(value, 0, 100, 0, 255);
  analogWrite(analog_fan, value);
}

/*
        传感器信息读取
*/
void sensorReading(){
  //获取温度
  float val;
  float voltage=0;
  val = analogRead(Temp_sensor);  //读取模拟原始数据    
  voltage= ( (float)val )/1023;
  voltage *= 5;                   //将模拟值转换为实际电压      
  temp =  voltage * 100;          //电压转化为温度
  //获取亮度
  lum = analogRead(analog_lum);
  lum = map(lum, 0, 1023, 100, 0); // 映射到 0~100
}
/*
        LCD1602显示
*/
void LCD1602(){
  lcd.init(); 
  if(showInfor == 0)
  showEI();
  else
  showCTRL();
}
/*
        显示环境信息
*/
void showEI(){
  lcd.setCursor(0,0); 
  lcd.print("Temp: ");
  lcd.print(temp);
  lcd.print("C");
  lcd.setCursor(0,1);
  lcd.print("lum: ");
  lcd.print(lum);
}
/*
        显示控制信息
*/
void showCTRL(){
  lcd.setCursor(0,0); 
  lcd.print("fanspeed: ");
  lcd.print(fanSpeed);
  lcd.print("%");
  lcd.setCursor(0,1);
  lcd.print("lumSet: ");
  lcd.print(lightLum);
  lcd.print("%");
}
/*
        数据发送
        封装格式  #亮度#温度#当前电灯亮度#当前风扇转速
*/
void Txd(){
  String  msg = "#" + (String)lum + "#" + (String)temp + "#" + (String)lightLum + "#" + (String)fanSpeed; 
  Serial.print(msg);Serial.print("\n");
}

/*
        自动控制程序
*/
void autoMation(){
  if(isAutoOpen == "true"){
    if(isAutoFanOpen = "true")
      autoFan( isAutoPowerOpen , autoFanValue );
    if(isAutoLedOpen = "true")
      autoLed( isAutoPowerOpen , autoLedvalue );
  }
}

/*
        串口接收数据
*/
void Rxd(){
  while (Serial.available() > 0)  
    {
        serial_received += char( Serial.read() );
        delay(2); 
    }
   if (serial_received.length() > 0)
    {
       int i,flag,count=0;
      //  Serial.println("serial_received:");
      //  Serial.println(serial_received);
      //  Serial.println("\n");
         /*
        自动化设置解析
        */
       if(serial_received[0] =='s'){ 
          isAutoOpen = "";
          isAutoPowerOpen = "";
          isAutoFanOpen = "";
          autoFanValue = "";
          isAutoLedOpen = "";
          autoLedvalue = "";
          for(i=0;i<serial_received.length();i++){
            if(serial_received[i]=='#') {
              count++; //接收第count个参数
              i++;//跳过当前为#的参数
            }
            switch(count){
              case 1: isAutoOpen += serial_received[i];      break;
              case 2: isAutoPowerOpen += serial_received[i]; break;
              case 3: isAutoFanOpen += serial_received[i];   break;
              case 4: autoFanValue += serial_received[i];    break;
              case 5: isAutoLedOpen += serial_received[i];   break;
              case 6: autoLedvalue += serial_received[i];    break;
            } 
          }
        }
        else{
        /*
        控制信息解析
        */
        flag=0;
        for(i=0;i<serial_received.length();i++)
        {
          if(serial_received[i]=='#')
              flag = 1; //0 ：第一个参数  1：第二个参数
          if(flag==0)
            led_lum += char(serial_received[i]);  //装入亮度
          if(flag==1&&serial_received[i]!='#')
            fan_speed += char(serial_received[i]);  //装入转速
        }
       }
       serial_received = "";
      /*
        亮度设定值解析
      */
       int lum_set;//设定亮度
       lum_set = atoi(led_lum.c_str());//string转int
       led_lum = "";//亮度缓存清空
       lightSet(lum_set);
      /*
        风扇设定转速解析
      */
       int speed_set;//设定速度
       speed_set = atoi(fan_speed.c_str());//string转int
       fan_speed = "";//转速缓存清空
       fanSet(speed_set);
    }
}


/*
        恒温系统
*/
void autoTemp(int value){
  int differ;//差值
  if(temp > value){
    differ = temp - value;
    if(differ <= 2) 
      fanSet(60);     //相差1~2度
    else if(differ > 2 && differ <= 4) 
      fanSet(80);//相差3~4度
    else 
      fanSet(100);//相差大于4度
  }
  else
    fanSet(0);
}

/*
        自动风扇
*/
void autoFan(String power,String value){
  int v = atoi(value.c_str());//目标温度值 v的范围是20°C~30°C
  if(power == "true"){  //自动电源开启
    if(digitalRead(body_sensor) == HIGH)
      delay(200);
      if(digitalRead(body_sensor) == HIGH)//有人
        autoTemp(v);
      else
        fanSet(0);
    }
  else
    autoTemp(v);
  }

/*
      自动亮度系统
*/
void autoLum(int value){
  int differ;//差值
  if(temp > value){
    differ = lum - value;
    if(differ <= 2) 
      lightSet(60);     //相差1~2度
    else if(differ > 2 && differ <= 4) 
      lightSet(80);//相差3~4度
    else 
      lightSet(100);//相差大于4度
  }
  else
    lightSet(0);
}

/*
        自动LED
*/
void autoLed(String power,String value){
  int differ;//差值
  int v = atoi(value.c_str());//目标亮度值
  if(power == "true"){  //自动电源开启
    if(digitalRead(body_sensor) == HIGH)
        delay(200);
        if(digitalRead(body_sensor) == HIGH)//有人
          autoLum(v);
        else
          lightSet(0);
    }
  else
    autoLum(v);
}

