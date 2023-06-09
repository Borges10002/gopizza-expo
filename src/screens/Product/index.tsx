import React, { useState } from "react";
import { Platform, TouchableOpacity, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

import {
  Container,
  Header,
  Title,
  DeleteLabel,
  Upload,
  PickImageButton,
  Form,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCharacters,
} from "./styles";

import { ButtonBack } from "../../components/ButtonBack";
import { Photo } from "../../components/Photo";
import { InputPrice } from "../../components/InputPrice";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Alert } from "react-native";

export function Product() {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceSizeP, setPriceSizeP] = useState("");
  const [priceSizeM, setPriceSizeM] = useState("");
  const [priceSizeG, setPriceSizeG] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handlePickerImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4],
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  }

  async function handleAdd() {
    if (!name.trim()) {
      return Alert.alert("Cadastro", "Informe o nome da pizza.");
    }

    if (!description.trim()) {
      return Alert.alert("Cadastro", "Informe a descrição da pizza.");
    }

    if (!image) {
      return Alert.alert("Cadastro", "Informe a imagem da pizza.");
    }

    if (!priceSizeP || !priceSizeM || !priceSizeG) {
      return Alert.alert(
        "Cadastro",
        "Informe o preço de todos os tamanhos da pizza."
      );
    }

    const fileName = new Date().getDate();
    const reference = storage().ref(`/pizzas/${fileName}.png`);

    await reference.putFile(image);
    const photo_url = await reference.getDownloadURL();

    firestore()
      .collection("pizzas")
      .add({
        name,
        name_insensitive: name.toLowerCase().trim(),
        description,
        prces_sizes: {
          p: priceSizeP,
          m: priceSizeM,
          g: priceSizeG,
        },
        photo_url,
        photo_path: reference.fullPath,
      })
      .then(() => Alert.alert("Cadastro", "Pizza cadastrada com sucesso."))
      .catch(() =>
        Alert.alert("Cadastro", "Não foi possivel cadastrar a pizza.")
      );

    setIsLoading(false);
  }

  return (
    <Container behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <ButtonBack />
          <Title>Cadastrar</Title>
          <TouchableOpacity>
            <DeleteLabel>Deletar</DeleteLabel>
          </TouchableOpacity>
        </Header>

        <Upload>
          <Photo uri={image} />
          <PickImageButton
            title='Carregar'
            type='secondary'
            onPress={handlePickerImage}
          />
        </Upload>

        <Form>
          <InputGroup>
            <Label>Nome</Label>
            <Input onChangeText={setName} value={name} />
          </InputGroup>

          <InputGroup>
            <InputGroupHeader>
              <Label>Descrição</Label>
              <MaxCharacters>0 de 60 caracteres</MaxCharacters>
            </InputGroupHeader>

            <Input
              multiline
              maxLength={60}
              style={{ height: 80 }}
              onChangeText={setDescription}
              value={description}
            />
          </InputGroup>

          <InputGroup>
            <Label>Tamanhos e preços</Label>

            <InputPrice
              size='P'
              onChangeText={setPriceSizeP}
              value={priceSizeP}
            />
            <InputPrice
              size='M'
              onChangeText={setPriceSizeM}
              value={priceSizeM}
            />
            <InputPrice
              size='G'
              onChangeText={setPriceSizeG}
              value={priceSizeG}
            />
          </InputGroup>

          <Button
            title='Cadastrar pizza'
            isLoading={isLoading}
            onPress={handleAdd}
          />
        </Form>
      </ScrollView>
    </Container>
  );
}
