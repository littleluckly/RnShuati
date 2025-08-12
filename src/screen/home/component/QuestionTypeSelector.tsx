import {useState} from 'react';
import {QuestionTypeViewModel} from '../types/Types';
import {Chip} from 'react-native-paper';
import {View} from 'react-native';

function QuestionTypeSelector() {
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeViewModel[]>([
    {id: 1, name: 'HTML', value: 'html'},
    {id: 2, name: 'CSS', value: 'css'},
    {id: 3, name: 'JS', value: 'js'},
    {id: 4, name: 'Node', value: 'node'},
    {id: 5, name: 'Vue', value: 'vue'},
    {id: 6, name: 'React', value: 'react'},
    {id: 7, name: 'Angular', value: 'angular'},
    {id: 8, name: '工程化', value: 'engineering'},
    {id: 9, name: '算法', value: 'algorithm'},
    {id: 10, name: '网络', value: 'network'},
    {id: 11, name: '综合技能', value: 'comprehensive'},
  ]);

  function onSelectQuestionType(questionType: QuestionTypeViewModel) {
    const newQuestionTypes = questionTypes.map(item => {
      if (item === questionType) {
        item.selected = !item.selected;
      }
      return item;
    });
    setQuestionTypes(newQuestionTypes);
  }
  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6}}>
      {questionTypes?.map(questionType => (
        <Chip
          key={questionType.value}
          selected={questionType.selected}
          mode={questionType.selected ? 'flat' : 'outlined'}
          onPress={() => onSelectQuestionType(questionType)}
          style={{}}>
          {questionType.name}
        </Chip>
      ))}
    </View>
  );
}

export default QuestionTypeSelector;
