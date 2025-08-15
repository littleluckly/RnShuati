import {View} from 'react-native';
import FeatureCard from './component/FeatureCard';
import {Text} from 'react-native-paper';
import GlobalStyles from '@/styles/globalStyles';

export default function WelcomeScreen() {
  return (
    <View style={{flex: 1}}>
      <View style={[{backgroundColor: 'white'}]}>
        <Text
          style={{
            flexShrink: 1,
            textAlign: 'left',
            lineHeight: 30,
            fontSize: 16,
          }}>
          {'\u3000\u3000'}一款面向「面试、考试」人群的高频刷题工具，通过「
          <Text style={{fontSize: 24}}>听力</Text>、
          <Text style={{fontSize: 24}}>智能组卷</Text>、普通、
          <Text style={{fontSize: 24}}>真题</Text>」四大模式及 3D
          卡片沉浸式体验，让用户在任何场景（通勤 / 熄屏 /
          碎片时间）都能高效刷题并沉淀个人知识库。
        </Text>
      </View>
      <FeatureCard></FeatureCard>
    </View>
  );
}
