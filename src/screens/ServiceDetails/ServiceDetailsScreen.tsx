import { Feather } from "@expo/vector-icons";
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import GradientButton from "@/src/components/GradientButton/GradientButton";
import { AppAlert } from "@/src/components/AppAlert";
import { auth } from "@/firebaseConfig";
import { useProfessions } from "@/src/hooks/useProfessions";
import { getPortfolio, getUserRole, PortfolioData } from "@/src/services/portfolioService";
import { reportService } from "@/src/services/reportService";
import {
  getServiceById,
  closeService,
  deleteServiceAsAdmin,
  ServiceDocument,
  serviceDateToDate,
} from "@/src/services/serviceService";
import {
  canCloseService,
  canViewServiceDetails,
} from "@/src/services/serviceManagementRules";
import {
  getServiceProposal,
  getServiceProposals,
  resolveProposalPortfolioUid,
  saveServiceProposal,
  ServiceProposal,
} from "@/src/services/proposalService";
import { formatProfessionName } from "@/src/utils/formatProfessionName";
import { RootStackParamList } from "../../../types/navigation";
import { styles } from "./ServiceDetailsScreen.styles";

const DELETE_COLORS: [string, string] = ["#E10B0B", "#B3261E"];

type DetailsRoute = RouteProp<RootStackParamList, "DetalhesServico">;

function formatDate(value: ServiceDocument["createdAt"]): string | null {
  const date = serviceDateToDate(value);
  return date ? date.toLocaleDateString("pt-BR") : null;
}

function formatProposalDate(value: ServiceProposal["createdAt"]): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toLocaleDateString("pt-BR");
  }

  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString("pt-BR");
  }

  return null;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function ExpandableText({
  text,
  textStyle,
}: {
  text: string;
  textStyle: StyleProp<TextStyle>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  return (
    <View style={styles.expandableTextContainer}>
      <Text
        style={[textStyle, styles.expandableTextMeasure]}
        onTextLayout={(event) => {
          const nextHasOverflow = event.nativeEvent.lines.length > 4;
          setHasOverflow((current) => current === nextHasOverflow ? current : nextHasOverflow);
        }}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
      >
        {text}
      </Text>
      <Text style={textStyle} numberOfLines={expanded ? undefined : 4}>
        {text}
      </Text>
      {hasOverflow && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Mostrar menos" : "Mostrar mais"}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((current) => !current)}
          hitSlop={8}
        >
          <Text style={styles.expandableTextToggle}>
            {expanded ? "Mostrar menos" : "Mostrar mais"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function ServicePhoto({
  uri,
  width,
  height,
  onPress,
}: {
  uri: string;
  width: number;
  height: number;
  onPress: () => void;
}) {
  const [imageStatus, setImageStatus] = useState<{
    uri: string;
    status: "loading" | "loaded" | "error";
  }>({ uri, status: "loading" });
  const imageState = imageStatus.uri === uri ? imageStatus.status : "loading";

  if (imageState === "error") {
    return (
      <View style={[styles.photoPlaceholder, { width, height }]}>
        <Feather name="image" size={34} color="#8A8A8E" />
      </View>
    );
  }
  const photo = (
    <View style={[styles.photoContainer, { width, height }]}>
      <Image
        source={{ uri }}
        style={[styles.photo, { width, height }]}
        contentFit="cover"
        onLoad={() => setImageStatus({ uri, status: "loaded" })}
        onError={() => {
          console.warn("Não foi possível carregar uma foto do serviço na galeria.");
          setImageStatus({ uri, status: "error" });
        }}
      />
      {imageState === "loading" && (
        <View style={styles.photoLoading}>
          <ActivityIndicator color="#5B69A3" />
        </View>
      )}
    </View>
  );

  return imageState === "loaded" ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ampliar foto do serviço"
      onPress={onPress}
    >
      {photo}
    </Pressable>
  ) : photo;
}

function ZoomableServicePhoto({
  uri,
  width,
  height,
  onError,
}: {
  uri: string;
  width: number;
  height: number;
  onError: () => void;
}) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(savedScale.value * event.scale, 1), 3);
    });
  const zoomedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  if (failed) {
    return (
      <View style={[styles.previewPlaceholder, { width, height }]}>
        <Feather name="image" size={38} color="#FFFFFF" />
        <Text style={styles.previewErrorText}>Não foi possível carregar esta foto.</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={[styles.zoomablePhoto, { width, height }, zoomedImageStyle]}>
        <Image
          source={{ uri }}
          style={styles.previewImage}
          contentFit="contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setFailed(true);
            setLoading(false);
            onError();
          }}
        />
        {loading && (
          <View style={styles.previewLoading}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function ServiceDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<DetailsRoute>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { namesById } = useProfessions();
  const [service, setService] = useState<ServiceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [ownerProfile, setOwnerProfile] = useState<PortfolioData | null>(null);
  const [currentUserPortfolio, setCurrentUserPortfolio] = useState<PortfolioData | null>(null);
  const [userProposal, setUserProposal] = useState<ServiceProposal | null>(null);
  const [proposals, setProposals] = useState<ServiceProposal[]>([]);
  const [proposalAuthors, setProposalAuthors] = useState<Record<string, PortfolioData>>({});
  const [proposalModalVisible, setProposalModalVisible] = useState(false);
  const [proposalValue, setProposalValue] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [closeConfirmationVisible, setCloseConfirmationVisible] = useState(false);
  const [serviceClosing, setServiceClosing] = useState(false);
  const serviceClosingRef = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentUserId = auth.currentUser?.uid;
  const isOwner = !!service && !!currentUserId && service.ownerUid === currentUserId;
  const canSubmitProposal = !!service && !!currentUserId && currentUserId !== service.ownerUid && !!currentUserPortfolio?.isActive && service.status === "open" && !userProposal;
  const canCloseCurrentService = canCloseService({
    currentUserUid: currentUserId,
    ownerUid: service?.ownerUid,
    serviceStatus: service?.status,
  });
  const canViewCurrentService = !!service && canViewServiceDetails({
    serviceStatus: service.status,
    isOwner,
    hasOwnProposal: !!userProposal,
  });

  const canReportService = !!service && !!currentUserId && !isOwner && !isAdmin;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(false);
      setService(null);
      setOwnerProfile(null);
      setCurrentUserPortfolio(null);
      setUserProposal(null);
      setProposals([]);
      setProposalAuthors({});

      const loadService = async () => {
        try {
          const result = await getServiceById(params.serviceId);
          if (!active || !result) {
            if (active) setService(null);
            return;
          }

          const ownerData = await getPortfolio(result.ownerUid).catch(() => null);
          const currentPortfolio = currentUserId
            ? await getPortfolio(currentUserId).catch(() => null)
            : null;
          const currentProposal = currentUserId
            ? await getServiceProposal(result.id, currentUserId)
            : null;
          const currentRole = currentUserId
            ? await getUserRole(currentUserId).catch(() => null)
            : null;

          if (!active) return;
          setIsAdmin(currentRole === "admin");

          setActivePhotoIndex(0);
          setService(result);
          setOwnerProfile(ownerData);
          setCurrentUserPortfolio(currentPortfolio);
          setUserProposal(currentProposal);

          if (result.ownerUid === currentUserId) {
            const serviceProposals = await getServiceProposals(result.id);
            if (!active) return;
            setProposals(serviceProposals);

            const uniqueAuthors = [...new Set(serviceProposals.map((item) => item.professionalUid).filter(Boolean))];
            const profiles = await Promise.all(
              uniqueAuthors.map(async (authorUid) => {
                const profile = await getPortfolio(authorUid).catch(() => null);
                return [authorUid, profile] as const;
              }),
            );

            if (!active) return;
            const nextProposalAuthors = profiles.reduce<Record<string, PortfolioData>>((acc, [authorUid, profile]) => {
              if (profile) {
                acc[authorUid] = profile;
              }
              return acc;
            }, {});
            setProposalAuthors(nextProposalAuthors);
          }
        } catch (loadError) {
          console.error(`Erro ao carregar detalhes do serviço (tentativa ${retryCount + 1}):`, loadError);
          if (active) setError(true);
        } finally {
          if (active) setLoading(false);
        }
      };

      void loadService();
      return () => {
        active = false;
      };
    }, [currentUserId, params.serviceId, retryCount]),
  );

  const profession = service?.professionId
    ? namesById[service.professionId]
    : undefined;
  const galleryWidth = Math.max(width - insets.left - insets.right, 1);
  const galleryHeight = Math.min(Math.max(galleryWidth * 0.68, 220), 330);
  const previewWidth = width;
  const previewHeight = height;
  const publishedDate = service ? formatDate(service.createdAt) : null;
  const deadlineDate = service ? formatDate(service.deadline) : null;
  const ownerName = service?.ownerName?.trim() || ownerProfile?.displayName?.trim() || null;
  const ownerPhotoUri = service?.ownerPhotoUri || ownerProfile?.photoUri || null;

  const handleConfirmDelete = async () => {
    if (!service || !isAdmin || deleting) return;

    setDeleting(true);
    try {
      await deleteServiceAsAdmin(service.id);
      setShowDeleteConfirm(false);
      Alert.alert("Serviço excluído", "O serviço foi excluído com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (deleteError) {
      console.error("Erro ao excluir serviço:", deleteError);
      setShowDeleteConfirm(false);
      Alert.alert("Erro", "Não foi possível excluir o serviço. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };


  const handleConfirmReport = async () => {
    if (!service || !currentUserId || reportSaving) return;

    setReportSaving(true);
    try {
      await reportService(service.id, service.title, currentUserId);
      setShowReportConfirm(false);
      Alert.alert("Denúncia enviada", "Obrigado! Nossa equipe vai analisar este serviço.");
    } catch (reportError) {
      setShowReportConfirm(false);
      if (reportError instanceof Error && reportError.message === "report-duplicate") {
        Alert.alert("Denúncia já enviada", "Você já denunciou este serviço.");
      } else {
        console.error("Erro ao denunciar serviço:", reportError);
        Alert.alert("Erro", "Não foi possível enviar a denúncia. Tente novamente.");
      }
    } finally {
      setReportSaving(false);
    }
  };


  const handleSubmitProposal = async () => {
    if (!service || !currentUserId) {
      Alert.alert("Atenção", "Faça login para enviar uma proposta.");
      return;
    }

    const numericValue = Number(proposalValue.replace(/[^\d]/g, ""));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero para a proposta.");
      return;
    }

    if (!proposalDescription.trim()) {
      Alert.alert("Descrição obrigatória", "Escreva a descrição da sua proposta.");
      return;
    }

    setProposalSubmitting(true);

    try {
      const createdProposal = await saveServiceProposal(
        service.id,
        numericValue * 100,
        proposalDescription.trim(),
      );

      setUserProposal(createdProposal);
      setProposalModalVisible(false);
      setProposalValue("");
      setProposalDescription("");
      Alert.alert("Proposta enviada", "Sua proposta foi registrada com sucesso.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Não foi possível enviar a proposta.";
      Alert.alert("Não foi possível enviar", message);
    } finally {
      setProposalSubmitting(false);
    }
  };

  const handleCloseService = async () => {
    if (!service || !canCloseCurrentService || serviceClosingRef.current) return;

    serviceClosingRef.current = true;
    setServiceClosing(true);
    try {
      await closeService(service.id);
      setService((current) => current ? { ...current, status: "closed" } : current);
      setCloseConfirmationVisible(false);
      Alert.alert("Serviço encerrado", "O serviço foi movido para seus serviços encerrados.");
    } catch (closeError) {
      const message = closeError instanceof Error
        ? closeError.message
        : "Não foi possível encerrar o serviço.";
      Alert.alert("Não foi possível encerrar", message);
    } finally {
      serviceClosingRef.current = false;
      setServiceClosing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle={selectedPhotoIndex !== null ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalhes do serviço</Text>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#5B69A3" />
          <Text style={styles.stateText}>Carregando serviço...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Não foi possível carregar o serviço.</Text>
          <Pressable style={styles.retryButton} onPress={() => setRetryCount((count) => count + 1)}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : !service || !canViewCurrentService ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Este serviço não está disponível.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.galleryCard}>
              {service.photos.length > 0 ? (
                <>
                  <FlatList
                    data={service.photos}
                    keyExtractor={(uri, index) => `${index}:${uri}`}
                    renderItem={({ item, index }) => (
                      <ServicePhoto
                        uri={item}
                        width={galleryWidth}
                        height={galleryHeight}
                        onPress={() => setSelectedPhotoIndex(index)}
                      />
                    )}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={[styles.gallery, { height: galleryHeight }]}
                    contentContainerStyle={styles.galleryContent}
                    onMomentumScrollEnd={(event) => {
                      setActivePhotoIndex(Math.round(event.nativeEvent.contentOffset.x / galleryWidth));
                    }}
                  />
                  {service.photos.length > 1 && (
                    <View pointerEvents="none" style={styles.galleryIndicators}>
                      {service.photos.map((_, index) => (
                        <View
                          key={`${index}-${service.photos[index]}`}
                          style={[styles.galleryIndicator, index === activePhotoIndex && styles.galleryIndicatorActive]}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.photoPlaceholder, { height: galleryHeight }]}>
                  <Feather name="image" size={38} color="#8A8A8E" />
                  <Text style={styles.placeholderText}>Sem fotos disponíveis</Text>
                </View>
              )}
            </View>

            <View style={styles.serviceSummary}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{service.title || "Serviço sem título"}</Text>
                {canReportService && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Denunciar serviço"
                    hitSlop={10}
                    style={styles.reportButton}
                    onPress={() => setShowReportConfirm(true)}
                  >
                    <Feather name="flag" size={22} color="#B3261E" />
                  </Pressable>
                )}
              </View>

              <View style={styles.infoRow}>
                {!!profession && (
                  <View style={styles.infoPill}>
                    <Text style={styles.infoPillText}>{formatProfessionName(profession)}</Text>
                  </View>
                )}
                {!!service.areas.length && (
                  <View style={styles.infoPill}>
                    <Text style={styles.infoPillText}>{service.areas.join(" • ")}</Text>
                  </View>
                )}
              </View>

              <View style={[styles.statusBadge, service.status !== "open" && styles.closedStatusBadge]}>
                <Text style={[styles.statusText, service.status !== "open" && styles.closedStatusText]}>
                  {service.status === "open" ? "Aberto" : "Encerrado"}
                </Text>
              </View>

              {!!service.location && (
                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={14} color="#5F667A" style={styles.locationIcon} />
                  <Text style={styles.metadataText}>{service.location}</Text>
                </View>
              )}

              {publishedDate && (
                <View style={styles.locationRow}>
                  <Feather name="calendar" size={14} color="#5F667A" style={styles.locationIcon} />
                  <Text style={styles.metadataText}>Publicado em {publishedDate}</Text>
                </View>
              )}

              {deadlineDate && (
                <View style={styles.locationRow}>
                  <Feather name="clock" size={14} color="#5F667A" style={styles.locationIcon} />
                  <Text style={styles.metadataText}>Prazo indicado pelo cliente: {deadlineDate}</Text>
                </View>
              )}
            </View>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Descrição</Text>
              <ExpandableText
                key={`service-description-${service.id}`}
                text={service.description || "Descrição não informada."}
                textStyle={styles.description}
              />
            </View>

            <View style={styles.clientSection}>
              <View style={styles.clientRow}>
                <View style={styles.clientAvatar}>
                  {ownerPhotoUri ? (
                    <Image
                      source={{ uri: ownerPhotoUri }}
                      style={styles.clientAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Feather name="user" size={21} color="#777777" />
                  )}
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientLabel}>{ownerName || "Cliente solicitante"}</Text>
                  {!!ownerName && <Text style={styles.clientType}>Cliente solicitante</Text>}
                </View>
              </View>
            </View>

            {isOwner && (
              <View style={styles.proposalsSection}>
                <View style={styles.proposalsHeadingRow}>
                  <Text style={styles.sectionTitle}>Propostas recebidas</Text>
                  {proposals.length > 0 && (
                    <View style={styles.proposalCount}>
                      <Text style={styles.proposalCountText}>{proposals.length}</Text>
                    </View>
                  )}
                </View>
                {proposals.length === 0 ? (
                  <Text style={styles.emptyProposalText}>Ainda não há propostas para este serviço.</Text>
                ) : (
                  proposals.map((proposal) => {
                    const proposalAuthor = proposalAuthors[proposal.professionalUid];
                    const authorName = proposalAuthor?.displayName || "Profissional";
                    const proposalDate = formatProposalDate(proposal.createdAt);
                    const portfolioTarget = resolveProposalPortfolioUid({
                      proposalProfessionalUid: proposal.professionalUid,
                    });

                    return (
                      <View key={proposal.id} style={styles.proposalCard}>
                        <View style={styles.proposalHeader}>
                          <View style={styles.smallAvatar}>
                            {proposalAuthor?.photoUri ? (
                              <Image
                                source={{ uri: proposalAuthor.photoUri }}
                                style={styles.smallAvatarImage}
                                contentFit="cover"
                              />
                            ) : (
                              <Feather name="briefcase" size={16} color="#777777" />
                            )}
                          </View>
                          <View style={styles.proposalHeaderText}>
                            <Text style={styles.proposalAuthor}>{authorName}</Text>
                            {!!proposalDate && (
                              <Text style={styles.proposalDate}>
                                {proposalDate}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={styles.proposalPrice}>{formatCurrency(proposal.estimatedCents)}</Text>
                        <View style={styles.proposalDescriptionBlock}>
                          <ExpandableText
                            key={`proposal-description-${proposal.id}`}
                            text={proposal.description}
                            textStyle={styles.proposalText}
                          />
                        </View>
                        <View style={styles.proposalMeta}>
                          <Text style={styles.proposalStatusText}>Proposta enviada</Text>
                        </View>
                        {portfolioTarget && (
                          <Pressable
                            style={styles.secondaryAction}
                            onPress={() => navigation.navigate("PortfolioProfissional", { professionalUid: portfolioTarget })}
                          >
                            <Text style={styles.secondaryActionText}>Ver portfólio</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {!isOwner && userProposal && (
              <View style={styles.proposalsSection}>
                <Text style={styles.sectionTitle}>Sua proposta</Text>
                <View style={styles.proposalCard}>
                  <View style={styles.proposalMeta}>
                    <Text style={styles.proposalPrice}>{formatCurrency(userProposal.estimatedCents)}</Text>
                    <View style={styles.proposalStatusPill}>
                      <Text style={styles.proposalStatusText}>Enviada</Text>
                    </View>
                  </View>
                  {!!formatProposalDate(userProposal.createdAt) && (
                    <Text style={styles.proposalDate}>
                      Enviada em {formatProposalDate(userProposal.createdAt)}
                    </Text>
                  )}
                  <View style={styles.proposalDescriptionBlock}>
                    <ExpandableText
                      key={`own-proposal-description-${userProposal.id}`}
                      text={userProposal.description}
                      textStyle={styles.proposalText}
                    />
                  </View>
                </View>
              </View>
            )}

            {!isOwner && service.status === "open" && !userProposal && (
              <View style={styles.ctaWrapper}>
                <GradientButton
                  label={proposalSubmitting ? "Enviando..." : "Enviar orçamento"}
                  colors={["#5B69A3", "#D36A31"]}
                  onPress={() => setProposalModalVisible(true)}
                  disabled={!canSubmitProposal || proposalSubmitting}
                />
              </View>
            )}

            {!isOwner && service.status === "open" && !currentUserId && (
              <Text style={styles.helperText}>Faça login para enviar uma proposta.</Text>
            )}

            {!isOwner && currentUserId && !currentUserPortfolio?.isActive && service.status === "open" && !userProposal && (
              <Text style={styles.helperText}>Ative o portfólio profissional para enviar uma proposta.</Text>
            )}

            {canCloseCurrentService && (
              <Pressable
                accessibilityRole="button"
                disabled={serviceClosing}
                style={styles.closeServiceButton}
                onPress={() => setCloseConfirmationVisible(true)}
              >
                <Text style={styles.closeServiceButtonText}>Encerrar serviço</Text>
              </Pressable>
            )}

            {isAdmin && !isOwner && (
              <View style={styles.adminDeleteWrapper}>
                <GradientButton
                  label={deleting ? "Excluindo..." : "Excluir serviço"}
                  colors={DELETE_COLORS}
                  onPress={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                />
              </View>
            )}
          </ScrollView>

          <AppAlert
            visible={showDeleteConfirm}
            character={require("@/assets/images/cuidado.png")}
            title="Tem certeza que deseja excluir este serviço?"
            subTitle={null}
            messages={["O serviço, as fotos e as propostas recebidas serão apagados.", "Esta ação não pode ser desfeita."]}
            buttonLabel="Cancelar"
            onClose={() => setShowDeleteConfirm(false)}
            secondaryButtonLabel={deleting ? "Excluindo..." : "Excluir serviço"}
            onSecondaryPress={handleConfirmDelete}
          />


          <AppAlert
            visible={showReportConfirm}
            character={require("@/assets/images/cuidado.png")}
            title="Deseja denunciar esse serviço?"
            subTitle={null}
            messages={null}
            buttonLabel="Sim, ele não segue as diretrizes do aplicativo"
            buttonTextStyle={styles.reportConfirmationText}
            buttonLoading={reportSaving}
            buttonLoadingLabel="Enviando..."
            onClose={handleConfirmReport}
            secondaryButtonLabel="Voltar"
            onSecondaryPress={() => {
              if (!reportSaving) setShowReportConfirm(false);
            }}
          />


          <AppAlert
            visible={closeConfirmationVisible}
            character={null}
            title="Encerrar serviço?"
            subTitle={null}
            messages={["O serviço deixará de aparecer na busca. Você poderá consultá-lo em Meus serviços."]}
            buttonLabel="Encerrar serviço"
            buttonTextStyle={styles.closeConfirmationText}
            buttonLoading={serviceClosing}
            buttonLoadingLabel="Encerrando..."
            onClose={handleCloseService}
            secondaryButtonLabel="Cancelar"
            onSecondaryPress={() => {
              if (!serviceClosing) setCloseConfirmationVisible(false);
            }}
          />

          <Modal
            visible={proposalModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setProposalModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Enviar proposta</Text>

                <Text style={styles.inputLabel}>Valor estimado</Text>
                <TextInput
                  style={styles.input}
                  value={proposalValue}
                  onChangeText={setProposalValue}
                  placeholder="Ex.: 2500"
                  keyboardType="numeric"
                  inputMode="numeric"
                />

                <Text style={styles.inputLabel}>Descrição da proposta</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={proposalDescription}
                  onChangeText={setProposalDescription}
                  placeholder="Descreva sua proposta"
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.secondaryButton, styles.modalSecondaryButton]}
                    onPress={() => setProposalModalVisible(false)}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.primaryButton, proposalSubmitting && styles.primaryButtonDisabled]}
                    disabled={proposalSubmitting}
                    onPress={handleSubmitProposal}
                  >
                    <Text style={styles.primaryButtonText}>
                      {proposalSubmitting ? "Enviando..." : "Enviar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
      <Modal
        visible={selectedPhotoIndex !== null && !!service}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhotoIndex(null)}
      >
        {selectedPhotoIndex !== null && service && (
          <View style={styles.imagePreviewModal}>
            <Pressable
              accessibilityLabel="Fechar imagem ampliada"
              style={styles.imagePreviewBackdrop}
              onPress={() => setSelectedPhotoIndex(null)}
            />
            <FlatList
              data={service.photos}
              style={styles.previewList}
              horizontal
              pagingEnabled
              initialScrollIndex={selectedPhotoIndex}
              getItemLayout={(_, index) => ({
                length: previewWidth,
                offset: previewWidth * index,
                index,
              })}
              keyExtractor={(uri, index) => `preview-${index}:${uri}`}
              renderItem={({ item, index }) => (
                <View style={[styles.previewPage, { width: previewWidth, height: previewHeight }]}>
                  <ZoomableServicePhoto
                    uri={item}
                    width={previewWidth}
                    height={previewHeight}
                    onError={() => {
                      console.warn(`Não foi possível carregar a foto ${index + 1} do serviço no visualizador.`);
                    }}
                  />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                setSelectedPhotoIndex(
                  Math.round(event.nativeEvent.contentOffset.x / previewWidth),
                );
              }}
            />
            {service.photos.length > 1 && (
              <View style={styles.previewPosition}>
                <Text style={styles.previewPositionText}>
                  {(selectedPhotoIndex ?? 0) + 1} / {service.photos.length}
                </Text>
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar imagem ampliada"
              style={[styles.closeImagePreviewButton, { top: insets.top + 12 }]}
              onPress={() => setSelectedPhotoIndex(null)}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}
