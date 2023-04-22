/*
    date: 20 Apr,2023
*/

// 定义引脚
#define analog_fan A1//风扇pwm
#define analog_light 3//电灯pwm
#define analog_lum 0 //光敏电阻接口
#define body_sensor 4//红外
#define Temp_sensor A3 //温度传感器接口
//串口变量
String serial_received;//串口接受
//状态变量
String led_lum = "";
String fan_speed = "";
String isAutoOpen = "";
String isAutoPowerOpen = "";
String isAutoFanOpen = "";
String autoFanValue = "";
String isAutoLedOpen = "";
String autoLedvalue = "";
//传感器变量
float val;
float voltage=0;
int lum_set;//设定亮度
int speed_set;//设定速度
int temp;//温度
int lum;//亮度

void setup() {
  Serial.begin(9600);
}

void loop() {
  sensorReading();//读取传感器
  Txd();//串口发送
  autoMation();//自动化控制
  Rxd();//串口接收
  delay(500);
}

/*
        设置风扇转速
        输入值为0~100 (映射到0~255)
*/
void fanSet(int value){
  value *= 2.55;
  analogWrite(analog_fan, value);
}
/*
        设置亮度
        输入值为0~100 (映射到0~255)
*/
void lightSet(int value){
  value *= 2.55;
  analogWrite(analog_fan, value);
}


/*
        传感器信息读取
*/
void sensorReading(){
  //获取温度
  val = analogRead(Temp_sensor);  //读取模拟原始数据     
  voltage= ( (float)val )/1023;
  voltage *= 5;          //读取模拟原始数据       
  temp =  voltage * 100;          //将模拟值转换为实际电压 
  // Serial.print("温度：%d\n",temp);
  //获取亮度
  lum = analogRead(analog_lum);
  // Serial.print("亮度：%d\n",lum);
}

/*
        数据发送
        封装格式  #亮度#温度#电灯状态#风扇状态
*/
void Txd(){
  String  msg = "#" + (String)lum + "#" + (String)temp; 
  Serial.print(msg);
}

/*
        自动控制程序
*/
void autoMation(){
  if(isAutoOpen = "true"){
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
       Serial.println("serial_received:");
       Serial.println(serial_received);
       Serial.println("\n");
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
            if(serial_received[i]=='#') 
              count++; //接收第count个参数
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
        /*
        控制信息解析
        */
       for(i=0;i<serial_received.length();i++)
       {
         if(serial_received[i]=='#')
            flag = 1; //0 ：第一个参数  1：第二个参数
         if(flag==0)
           led_lum += char(serial_received[i]);  //装入亮度
         if(flag==1&&serial_received[i]!='#')
           fan_speed += char(serial_received[i]);  //装入转速
       }
       serial_received = "";
      /*
        亮度设定值解析
      */
       lum_set = atoi(led_lum.c_str());//string转int
       led_lum = "";//亮度缓存清空
       lightSet(lum_set);
      /*
        风扇设定转速解析
      */
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
    if(digitalRead(body_sensor) == HIGH)//有人
      autoLum(v);
    else
      lightSet(0);
    }
  else
    autoLum(v);
}

