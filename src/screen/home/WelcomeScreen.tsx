import {View} from 'react-native';
import FeatureCard from './component/FeatureCard';
import {Text} from 'react-native-paper';

export default function WelcomeScreen() {
  return (
    <View>
      <View style={{backgroundColor: 'white', padding: 12}}>
        <Text>
          一款面向「面试、考试」人群的高频刷题工具，通过「听力、智能组卷、普通、真题」四大模式及
          3D 卡片沉浸式体验，让用户在任何场景（通勤 / 熄屏 /
          碎片时间）都能高效刷题并沉淀个人知识库。
        </Text>
      </View>
      <FeatureCard></FeatureCard>
    </View>
  );
}
