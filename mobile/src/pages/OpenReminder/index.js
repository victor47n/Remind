import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity, Switch, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/api';
import 'moment/locale/pt-br';
import moment from "moment";

import styles from './styles';
import { DrawerContentScrollView } from '@react-navigation/drawer';

export default function OpenReminder({ route, navigation }) {
    moment.locale('pt-BR');
    moment.updateLocale('pt-br', { weekdaysMin: 'D_S_T_Q_Q_S_S'.split('_') });
    // const toggleSwitch = () => setRepeat(previousState => !previousState);
    const [reminder, setReminder] = useState([]);
    const [days, setDays] = useState([]);
    // const [dayWeek, setDayWeek] = useState([]);
    const [repeat, setRepeat] = useState(false);
    const remindInfo = route.params.reminder;
    async function showReminder(){
        const response = await api.get(`reminder/${remindInfo._id}`);
        const detail = response.data.reminder;
        await setReminder(detail);
        await setRepeat(detail.repeat);
        // await setDayWeek([...reminder.dayWeek, number]);
    }

    useEffect( () => {
        const timer = setInterval(() => {
            showReminder()
        }, 1000);
        
        return () => clearInterval(timer);
    }, [remindInfo]);

    const data = [
        {
            number: '0',
        },
        {
            number: '1',
        },
        {
            number: '2',
        },
        {
            number: '3',
        },
        {
            number: '4',
        },
        {
            number: '5',
        },
        {
            number: '6',
        },
    ];
    
    function navigateToReminder(reminder) {
        navigation.navigate('EditReminder', { reminder });
    }

    function finishReminder() {
        const reminderId = reminder._id;
        if(reminder){
            if(reminder.status ==  true){
                try {
                    const response = api.put('reminder/status', {
                        reminderId,
                        status: false,
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            if(reminder.status ==  false){
                try {
                    setReminder(remindInfo);
                    const response = api.put('reminder/status', {
                        reminderId,
                        status: true,
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }
        
    }
    function goToBack() {
        navigation.navigate('Home');
    }
    async function excluir() {
        try {
            const response = await api.delete(`reminder/${reminder._id}`);
            goToBack();
        } catch (error) {
            alert(error);
        }
    }
    // reminder.dayWeek.map(_day => {
    //     moment(_day).format('dddd');
    //     console.log(_day) 
    // })
    let showDayWeek = () =>{
        // const valores = reminder.dayWeek.map(day => {
        //     // console.log(day.number)
        //     return day.number;
        //   })

        if(reminder ){
        return(
            <View>
                <Text style={styles.reminderRepeat}>{reminder !== null ? moment(reminder.dateActivity).format('LL'):"Apagado"}</Text> 
                <Text style={styles.reminderRepeat}>Repetir: {reminder !== null ? moment(new Date(reminder.dateActivity), "d").format('dddd'):"Apagado"}</Text> 
                <Text style={styles.reminderRepeat}>Horario: {reminder !== null ? moment(new Date(reminder.dateActivity), "hmm").add(3, 'hours').format("HH:mm"):"Apagado"}</Text> 
                {/* <Text style={styles.reminderRepeat}>{}</Text>  */}
                {/* {
                reminder.dayWeek.map(day => {
                    <>  
                        <Text  key={day.number} >{reminder !== null ? moment(new Date(day.number), "d").format('dddd'):"Apagado"}</Text>
                    </>
                 })
                } */}
            </View>
        )}
    }
    let showDate = () => {
        if(reminder){
        return(
            <View>
                <Text style={styles.reminderRepeat}>{reminder !== null ? moment(reminder.dateActivity).format('LL'):"Apagado"}</Text> 
                <Text style={styles.reminderRepeat}>{reminder !== null ? moment(reminder.dateActivity).add(3, 'hours').calendar():"Apagado"}</Text> 
            </View>
        )}
    }

    let buttonFinish = () => {
        
        if(reminder){
            if(reminder.status == false){
               return <Text style={styles.buttonText} >Marcar como concluído</Text>
            }
            if(reminder.status == true){
                return <Text style={styles.buttonText} >Desmarcar lembrete.</Text>
            }
        }
    }
    
    return (
        <View style={styles.background}>
            <LinearGradient colors={["#6C64FB", "#9B67FF"]} style={styles.statusBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <StatusBar translucent={true} backgroundColor={'transparent'} style="light" />
                <View style={styles.iconsContainer}>
                    <TouchableOpacity style={styles.buttonClose} onPress={goToBack} >
                        <MaterialIcons name="close" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonEdit} onPress={() => navigateToReminder(reminder)} >
                        <MaterialIcons name="mode-edit" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonDots} onPress={excluir}>
                        <MaterialIcons name="delete" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.container}>

                    <Text style={styles.reminderName}>{reminder === null ? "Apagado": reminder.description}</Text>
                    {reminder.repeat === true ?  showDayWeek() : showDate() }
                    
                {/* <View style={styles.repeatBox}>
                    <Text style={styles.repeatTitle}>Repetir às/aos</Text>
                    <FlatList
                        style={styles.week}
                        data={reminder.dayWeek}
                        numColumns={7}
                        contentContainerStyle={{ paddingBottom: 24, paddingTop: 16, paddingHorizontal: 40, }}
                        keyExtractor={_week => String(_week.number)}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item: _week }) => (
                            
                                <Text style={dayWeek.includes(_week.number) ? styles.weekDayTextSelected : styles.weekDayText}>{moment(new Date(_week.number), "d").format('dddd')`\n`}</Text>
                            
                        )}
                    >
                    </FlatList>
                </View> */}

                    {/* <Text style={styles.reminderHour}>{`${moment(new Date(reminder.dateActivity), "hmm").format("HH:mm")}`}</Text> */}
                    {/* <Text style={styles.reminderRepeat}>Repete Repetição</Text> */}
                </View>

            </LinearGradient >

            <TouchableOpacity onPress={finishReminder}>
                <LinearGradient colors={reminder != null && reminder.status === false ? ["#FE9DA4", "#FC81A7"]:["#cccccc", "#cccccc"]} style={styles.buttonBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    {buttonFinish()}
                </LinearGradient>
            </TouchableOpacity>

        </View>

    )
}