import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { FlatList, Keyboard, ListRenderItemInfo, Platform, ScrollView, StatusBar, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import dayjs from 'dayjs';

import { Header } from '~/components/Header';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Text } from '~/components/Text';

import { useDimension } from '~/zustands/app';

import { useApiGetVisitHistoryList } from '~/hooks/api.get.visit.history.list';
import { useApiPutVisitReview } from '~/hooks/api.put.visit.review';

import { STATIC_IMAGE } from '~/utils/constant';
import { Visit } from '~/types/visit';
import { COLOR } from '~/utils/guide';
import { font } from '~/style';
import Util from '~/utils/common';

import style from './style';

export const History = memo(function () {
  const writeModalScroll = useRef<ScrollView>();

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isActivatedKeyboard, setIsActivatedKeyboard] = useState<boolean>(false);
  const [isVisibleWriteModal, setIsVisibleWriteModal] = useState<boolean>(false);
  const [writeModalReview, setWriteModalReview] = useState<string>('');

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [list, setList] = useState<Visit[]>([]);

  const { dimension } = useDimension();

  const { apiGetVisitHistoryList } = useApiGetVisitHistoryList();
  const { apiPutVisitReview } = useApiPutVisitReview();
  const { bottom } = useSafeAreaInsets();

  const selectedIndexRef = useRef<number>();

  if (selectedIndexRef.current !== selectedIndex) {
    selectedIndexRef.current = selectedIndex;
  }

  const listRef = useRef<Visit[]>();

  if (listRef.current !== list) {
    listRef.current = list;
  }

  const writeModalReviewRef = useRef<string>();

  if (writeModalReviewRef.current !== writeModalReview) {
    writeModalReviewRef.current = writeModalReview;
  }

  const handleWriteModalClose = useCallback(() => {
    setIsVisibleWriteModal(false);
    setWriteModalReview('');
  }, []);

  const handleSelectItem = useCallback((index: number) => {
    setSelectedIndex((prevSelectedIndex) => (prevSelectedIndex === index ? -1 : index));
  }, []);

  const handleWriteForm = useCallback(() => {
    setWriteModalReview(listRef.current[selectedIndexRef?.current]?.review?.content || '');
    setIsVisibleWriteModal(true);
  }, []);

  const handleWriteReview = useCallback(async () => {
    await apiPutVisitReview({
      visitId: listRef.current[selectedIndexRef.current].id,
      content: writeModalReviewRef.current,
    });

    setList((prevList) => {
      const _list = [...prevList];

      if (!_list[selectedIndexRef.current]?.review) {
        _list[selectedIndexRef.current].review = {};
      }

      _list[selectedIndexRef.current].review.content = writeModalReviewRef.current;

      return _list;
    });

    handleWriteModalClose();
    setSelectedIndex(-1);
  }, []);

  const handleKeyboardShow = useCallback(() => {
    setIsActivatedKeyboard(true);

    Util.sleep(300).then(() =>
      writeModalScroll.current.scrollTo({
        y: 9999,
        animated: true,
      }),
    );
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setIsActivatedKeyboard(false);
  }, []);

  const init = useCallback(async () => {
    const _list = await apiGetVisitHistoryList();

    setIsLoaded(true);
    setList(_list);
  }, []);

  useEffect(() => {
    init();

    const subsKeyboardShow = Keyboard.addListener(Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow', handleKeyboardShow);
    const subsKeyboardHide = Keyboard.addListener(Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide', handleKeyboardHide);

    return () => {
      if (subsKeyboardShow) {
        subsKeyboardShow.remove();
      }

      if (subsKeyboardHide) {
        subsKeyboardHide.remove();
      }
    };
  }, []);

  const MemoizedRenderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Visit>) => {
      return (
        <Button style={style.item} onPress={() => handleSelectItem(index)}>
          <View style={style.itemImageWrap}>
            {item.review && (
              <FastImage source={STATIC_IMAGE.CHECK_CIRCLE_GREEN_FILL} style={style.writedReviewImage} resizeMode="contain" />
            )}
            {selectedIndex === index && (
              <View style={style.selectedItem}>
                <FastImage source={STATIC_IMAGE.CHECK_GREEN} style={style.selectedItemImage} resizeMode="contain" />
              </View>
            )}
            <FastImage source={{ uri: item?.site?.imageUrl }} style={style.itemImage} resizeMode="cover" />
          </View>
          <Text style={[font.BODY1_SB, style.itemNameText]}>{item.site?.name}</Text>
          <Text style={[font.BODY2_R, style.itemDateText]}>{item.createdAt && dayjs(new Date(item.createdAt)).format('YYYY.MM.DD')}</Text>
        </Button>
      );
    },
    [selectedIndex],
  );

  return (
    <View style={[style.container, { paddingBottom: bottom }]}>
      <Modal
        isVisible={isVisibleWriteModal}
        style={style.writeModal}
        statusBarTranslucent={true}
        deviceWidth={dimension.width}
        deviceHeight={dimension.height + StatusBar.currentHeight}
        animationIn="fadeIn"
        animationInTiming={200}
        animationOut="fadeOut"
        animationOutTiming={200}
        useNativeDriver={true}
        onBackButtonPress={handleWriteModalClose}
        onBackdropPress={handleWriteModalClose}>
        <View style={style.writeModalContainer}>
          <ScrollView
            ref={writeModalScroll}
            style={style.writeModalScroll}
            contentContainerStyle={[style.writeModalScrollContainer, { paddingBottom: isActivatedKeyboard ? 240 : 30 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text style={[font.SUBTITLE3_M, style.writeModalTitleText]}>Review</Text>
            {list[selectedIndex] && (
              <>
                <FastImage source={{ uri: list[selectedIndex]?.site?.imageUrl }} style={style.writeModalImage} resizeMode="cover" />
                <Text style={[font.SUBTITLE1, style.writeModalNameText]}>{list[selectedIndex]?.site?.name}</Text>
                <Text style={[font.BODY1_R, style.writeModalDateText]}>
                  {list[selectedIndex].createdAt && dayjs(new Date(list[selectedIndex].createdAt)).format('YYYY.MM.DD')}
                </Text>
                <Text style={[font.BODY1_R, style.writeModalDescriptionText]}>{list[selectedIndex]?.site?.description}</Text>
                <View style={style.writeModalInputWrap}>
                  <Text style={[font.BODY2_B, style.writeModalInputLabelText]}>Visitor Review</Text>
                  <Input
                    value={writeModalReview}
                    placeholder="Please write a thoughtful review!"
                    maxLength={MAX_INPUT_REVIEW}
                    multiline={true}
                    scrollEnabled={true}
                    wrapperStyle={style.writeModalInputWrapper}
                    containerStyle={style.writeModalInputContainer}
                    onChangeText={(text) => setWriteModalReview(text)}
                  />
                  <Text style={[font.CAPTION1_R, style.writeModalInputCountHighlight]}>
                    {writeModalReview.length}
                    <Text style={style.writeModalInputCount}>/{MAX_INPUT_REVIEW}</Text>
                  </Text>
                </View>
                <View style={style.writeModalButtonWrap}>
                  <Button style={style.writeModalCloseButton} onPress={handleWriteModalClose}>
                    <Text style={[font.BODY1_B, style.writeModalCloseButtonText]}>Close</Text>
                  </Button>
                  <Button
                    style={[style.writeModalConfirmButton, { backgroundColor: writeModalReview.length ? COLOR.PRI_1_500 : COLOR.DISABLED }]}
                    onPress={handleWriteReview}>
                    <Text style={[font.BODY1_B, { color: writeModalReview.length ? COLOR.WHITE : '#C2C3C6' }]}>Confirm</Text>
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
      <Header title="Vistor History" />
      <View style={style.body}>
        <View style={style.bodyContent}>
          {isLoaded ? (
            list.length ? (
              <FlatList
                style={style.list}
                contentContainerStyle={style.listContainer}
                numColumns={3}
                data={list}
                renderItem={MemoizedRenderItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={style.emptyDataContainer}>
                <FastImage source={STATIC_IMAGE.EMPTY_DATA} style={style.emptyDataImage} resizeMode="contain" />
                <Text style={[font.BODY1_SB, style.emptyDataText]}>No visit history</Text>
              </View>
            )
          ) : null}
        </View>
        {selectedIndex > -1 && (
          <LinearGradient
            colors={[
              'rgba(249, 249, 249, 0)',
              'rgba(249, 249, 249, 0.4)',
              'rgba(249, 249, 249, 0.8)',
              'rgba(249, 249, 249, 0.9)',
              'rgba(249, 249, 249, 1)',
            ]}
            style={style.writeButtonWrap}>
            <Button style={style.writeButton} onPress={handleWriteForm}>
              <Text style={[font.BODY3_SB, style.writeButtonText]}>Write a Review</Text>
            </Button>
          </LinearGradient>
        )}
      </View>
    </View>
  );
});

const MAX_INPUT_REVIEW = 300;
