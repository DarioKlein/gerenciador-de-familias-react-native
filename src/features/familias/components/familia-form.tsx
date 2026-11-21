import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCepsRepository } from '@/database/use-ceps-repository';
import {
  CepServiceError,
  consultarCep,
  formatarCep,
  MAX_CARACTERES_CEP_FORMATADO,
  MAX_DIGITOS_CEP,
  obterDigitosCep,
  pertenceAoMunicipioAtendido,
  pesquisarCepPorEndereco,
  type EnderecoCep,
} from '@/features/familias/cep';
import {
  CARGOS,
  CIDADES,
  getLocalidadeLabel,
  MINISTERIOS,
  MUNICIPIO_OFICIAL,
  obterSetorDaFamilia,
  SITUACOES_ECONOMICAS,
  SITUACOES_RELIGIOSAS,
  TIPOS_RESIDENCIA,
  type Cargo,
  type Cidade,
  type Ministerio,
  type SituacaoEconomica,
  type SituacaoReligiosa,
  type TipoResidencia,
} from '@/features/familias/constants';
import type { Familia, FamiliaInput } from '@/features/familias/types';
import {
  formatarTelefoneCelular,
  MAX_CARACTERES_TELEFONE_FORMATADO,
} from '@/features/familias/telefone';
import {
  validarFamilia,
  type FamiliaValidationErrors,
} from '@/features/familias/validation';
import { useTheme } from '@/hooks/use-theme';

import { ChoiceChips, MultipleChoiceChips } from './choice-chips';
import { CepResultsModal } from './cep-results-modal';
import { FormTextField } from './form-text-field';
import { SelectField } from './select-field';

type FamiliaFormProps = {
  initialValue?: Familia;
  bairros: readonly string[];
  submitLabel: string;
  onSubmit: (input: FamiliaInput) => Promise<void>;
  onCancel: () => void;
};

function createInitialState(value?: Familia): FamiliaInput {
  return {
    nome: value?.nome ?? '',
    endereco: value?.endereco ?? '',
    cep: formatarCep(value?.cep ?? ''),
    numero: value?.numero ?? '',
    bairro: value?.bairro ?? '',
    cidade: value?.cidade ?? null,
    telefone: formatarTelefoneCelular(value?.telefone ?? ''),
    cargos: value?.cargos ?? [],
    ministerio: value?.ministerio ?? null,
    situacaoReligiosa: value?.situacaoReligiosa ?? null,
    situacaoEconomica: value?.situacaoEconomica ?? null,
    residencia: value?.residencia ?? null,
  };
}

export function FamiliaForm({
  initialValue,
  bairros,
  submitLabel,
  onSubmit,
  onCancel,
}: FamiliaFormProps) {
  const theme = useTheme();
  const cepsRepository = useCepsRepository();
  const [form, setForm] = useState<FamiliaInput>(() => createInitialState(initialValue));
  const formRef = useRef(form);
  const lastCepSearch = useRef(obterDigitosCep(initialValue?.cep ?? ''));
  const cepRequestId = useRef(0);
  const [errors, setErrors] = useState<FamiliaValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepSearching, setCepSearching] = useState(false);
  const [cepSuggestion, setCepSuggestion] = useState<EnderecoCep | null>(null);
  const [cepFeedback, setCepFeedback] = useState<{
    kind: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);
  const [cepResults, setCepResults] = useState<EnderecoCep[]>([]);
  const [cepResultsOpen, setCepResultsOpen] = useState(false);
  const [usingCachedResults, setUsingCachedResults] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const setorIdentificado = obterSetorDaFamilia({
    cidade: form.cidade,
    bairro: form.bairro,
  });

  const setField = <K extends keyof FamiliaInput>(field: K, value: FamiliaInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  };

  const applyCepAddress = (result: EnderecoCep, overwrite: boolean) => {
    setForm((current) => ({
      ...current,
      cep: result.cep,
      endereco:
        overwrite || !current.endereco.trim() ? result.endereco : current.endereco,
      bairro:
        overwrite || !current.bairro?.trim()
          ? result.bairro ?? current.bairro
          : current.bairro,
    }));
    setErrors((current) => ({
      ...current,
      cep: undefined,
      endereco: undefined,
      bairro: undefined,
    }));
    setCepSuggestion(null);
  };

  const handleFoundCep = (result: EnderecoCep, source: 'cache' | 'network') => {
    if (!pertenceAoMunicipioAtendido(result)) {
      setCepFeedback({
        kind: 'error',
        message: `Este CEP não pertence a ${MUNICIPIO_OFICIAL}/SP.`,
      });
      return;
    }

    const current = formRef.current;
    const currentAddress = current.endereco.trim().toLocaleLowerCase('pt-BR');
    const currentNeighborhood = current.bairro?.trim().toLocaleLowerCase('pt-BR') ?? '';
    const addressConflict =
      Boolean(currentAddress && result.endereco) &&
      currentAddress !== result.endereco.toLocaleLowerCase('pt-BR');
    const neighborhoodConflict =
      Boolean(currentNeighborhood && result.bairro) &&
      currentNeighborhood !== result.bairro?.toLocaleLowerCase('pt-BR');

    if (addressConflict || neighborhoodConflict) {
      setCepSuggestion(result);
      setCepFeedback({
        kind: 'info',
        message: 'O CEP possui um endereço diferente do que já foi digitado.',
      });
      return;
    }

    applyCepAddress(result, false);
    setCepFeedback({
      kind: result.endereco ? 'success' : 'info',
      message: result.endereco
        ? source === 'cache'
          ? 'Endereço preenchido com uma consulta salva neste aparelho.'
          : 'Endereço preenchido pelo CEP. Confirme a localidade ou distrito.'
        : 'CEP encontrado. Complete a rua manualmente e confirme a localidade ou distrito.',
    });
  };

  const lookupCep = async (cep: string, requestId: number) => {
    try {
      setCepLoading(true);
      setCepFeedback(null);
      setCepSuggestion(null);

      const cached = await cepsRepository.buscarPorCep(cep);
      if (requestId !== cepRequestId.current) return;
      if (cached) {
        handleFoundCep(cached, 'cache');
        return;
      }

      const result = await consultarCep(cep);
      if (pertenceAoMunicipioAtendido(result)) {
        try {
          await cepsRepository.salvar(result);
        } catch {
          // A consulta ainda pode ser usada mesmo se o cache local falhar.
        }
      }
      if (requestId !== cepRequestId.current) return;
      handleFoundCep(result, 'network');
    } catch (error) {
      if (requestId !== cepRequestId.current) return;
      setCepFeedback({
        kind: 'error',
        message:
          error instanceof CepServiceError
            ? error.message
            : 'Não foi possível consultar o CEP.',
      });
    } finally {
      if (requestId === cepRequestId.current) setCepLoading(false);
    }
  };

  const changeCep = (value: string) => {
    const formatted = formatarCep(value);
    const digits = obterDigitosCep(formatted);
    setField('cep', formatted);
    setCepFeedback(null);
    setCepSuggestion(null);

    if (digits.length !== MAX_DIGITOS_CEP) {
      cepRequestId.current += 1;
      lastCepSearch.current = '';
      setCepLoading(false);
      return;
    }

    if (lastCepSearch.current === digits) return;
    lastCepSearch.current = digits;
    const requestId = ++cepRequestId.current;
    void lookupCep(formatted, requestId);
  };

  const searchCepByAddress = async () => {
    const address = formRef.current.endereco.trim();
    if (address.length < 3) {
      setCepFeedback({
        kind: 'error',
        message: 'Informe pelo menos 3 caracteres da rua para buscar o CEP.',
      });
      return;
    }

    try {
      setCepSearching(true);
      setCepFeedback(null);
      const cached = await cepsRepository.buscarPorEndereco(address);

      try {
        const remote = (await pesquisarCepPorEndereco(address)).filter(
          pertenceAoMunicipioAtendido
        );
        if (remote.length === 0) {
          throw new CepServiceError(
            `Nenhum CEP de ${MUNICIPIO_OFICIAL}/SP foi encontrado para essa rua.`,
            'not-found'
          );
        }
        try {
          await cepsRepository.salvarVarios(remote);
        } catch {
          // Os resultados remotos continuam disponíveis sem o cache.
        }
        setCepResults(remote);
        setUsingCachedResults(false);
      } catch (error) {
        if (cached.length === 0) throw error;
        setCepResults(cached);
        setUsingCachedResults(true);
      }

      setCepResultsOpen(true);
    } catch (error) {
      setCepFeedback({
        kind: 'error',
        message:
          error instanceof CepServiceError
            ? error.message
            : 'Não foi possível buscar o CEP pelo endereço.',
      });
    } finally {
      setCepSearching(false);
    }
  };

  const selectCepResult = (result: EnderecoCep) => {
    cepRequestId.current += 1;
    setCepLoading(false);
    applyCepAddress(result, true);
    lastCepSearch.current = obterDigitosCep(result.cep);
    setCepResultsOpen(false);
    setCepFeedback({
      kind: 'success',
      message: 'CEP e endereço preenchidos. Confirme a localidade ou distrito.',
    });
  };

  const submit = async () => {
    const validation = validarFamilia(form);
    if (!validation.success) {
      setErrors(validation.errors);
      setSubmitError('Revise os campos destacados antes de salvar.');
      return;
    }

    try {
      setSaving(true);
      setSubmitError(null);
      await onSubmit(validation.data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível salvar a família.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={[styles.infoBanner, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.infoIcon, { backgroundColor: theme.backgroundElement }]}>
                  <AppIcon name="info" color={theme.primary} size={22} />
                </View>
                <View style={styles.infoCopy}>
                  <ThemedText type="smallBold" style={{ color: theme.primary }}>
                    Cadastro simples e local
                  </ThemedText>
                  <ThemedText>
                    Somente nome e endereço são obrigatórios. Os demais dados podem ser
                    preenchidos depois.
                  </ThemedText>
                </View>
              </View>

              <FormSection title="Identificação" icon="badge">
                <FormTextField
                  label="Nome da família ou responsável"
                  required
                  value={form.nome}
                  error={errors.nome}
                  placeholder="Ex.: Família Oliveira"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onChangeText={(value) => setField('nome', value)}
                />
                <FormTextField
                  label="Telefone"
                  value={form.telefone ?? ''}
                  error={errors.telefone}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maxLength={MAX_CARACTERES_TELEFONE_FORMATADO}
                  onChangeText={(value) =>
                    setField('telefone', formatarTelefoneCelular(value))
                  }
                />
              </FormSection>

              <FormSection title="Endereço" icon="location">
                <FormTextField
                  label="CEP"
                  value={form.cep ?? ''}
                  error={errors.cep}
                  hint={cepLoading ? 'Consultando CEP…' : 'Preenchimento automático opcional.'}
                  placeholder="00000-000"
                  keyboardType="number-pad"
                  maxLength={MAX_CARACTERES_CEP_FORMATADO}
                  onChangeText={changeCep}
                />

                {cepSuggestion ? (
                  <View
                    style={[
                      styles.cepSuggestion,
                      { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                    ]}>
                    <View style={styles.cepSuggestionCopy}>
                      <ThemedText type="smallBold">Endereço encontrado</ThemedText>
                      <ThemedText type="small">
                        {cepSuggestion.endereco}
                        {cepSuggestion.bairro ? ` · ${cepSuggestion.bairro}` : ''}
                      </ThemedText>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        applyCepAddress(cepSuggestion, true);
                        setCepFeedback({
                          kind: 'success',
                          message: 'Endereço substituído pelos dados do CEP.',
                        });
                      }}
                      style={[styles.useCepButton, { backgroundColor: theme.primary }]}>
                      <ThemedText type="smallBold" style={styles.saveText}>
                        Usar endereço
                      </ThemedText>
                    </Pressable>
                  </View>
                ) : null}

                {cepFeedback ? (
                  <View
                    style={[
                      styles.cepFeedback,
                      {
                        backgroundColor:
                          cepFeedback.kind === 'error'
                            ? theme.dangerSoft
                            : theme.primarySoft,
                      },
                    ]}>
                    <AppIcon
                      name={cepFeedback.kind === 'error' ? 'warning' : 'info'}
                      color={
                        cepFeedback.kind === 'error' ? theme.danger : theme.primary
                      }
                      size={19}
                    />
                    <ThemedText
                      type="small"
                      style={[
                        styles.cepFeedbackText,
                        {
                          color:
                            cepFeedback.kind === 'error' ? theme.danger : theme.text,
                        },
                      ]}>
                      {cepFeedback.message}
                    </ThemedText>
                  </View>
                ) : null}

                <FormTextField
                  label="Rua ou avenida"
                  required
                  value={form.endereco}
                  error={errors.endereco}
                  placeholder="Ex.: Rua das Flores"
                  autoCapitalize="words"
                  onChangeText={(value) => setField('endereco', value)}
                />
                <FormTextField
                  label="Número"
                  value={form.numero ?? ''}
                  placeholder="Ex.: 142, S/N ou Fundos"
                  onChangeText={(value) => setField('numero', value)}
                />
                <FormTextField
                  label="Bairro"
                  value={form.bairro ?? ''}
                  placeholder="Ex.: Centro"
                  autoCapitalize="words"
                  onChangeText={(value) => setField('bairro', value)}
                />
                {bairros.length > 0 ? (
                  <View style={styles.suggestions}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Bairros já cadastrados
                    </ThemedText>
                    <View style={styles.suggestionList}>
                      {bairros.slice(0, 6).map((bairro) => (
                        <Pressable
                          key={bairro}
                          accessibilityRole="button"
                          onPress={() => setField('bairro', bairro)}
                          style={({ pressed }) => [
                            styles.suggestion,
                            {
                              backgroundColor:
                                form.bairro === bairro ? theme.primarySoft : theme.input,
                              borderColor:
                                form.bairro === bairro ? theme.primary : theme.border,
                              opacity: pressed ? 0.75 : 1,
                            },
                          ]}>
                          <ThemedText type="smallBold">{bairro}</ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
                <SelectField<Cidade>
                  label="Localidade / distrito"
                  value={(form.cidade as Cidade | null) ?? null}
                  options={CIDADES}
                  getLabel={getLocalidadeLabel}
                  error={errors.cidade}
                  onChange={(value) => setField('cidade', value)}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  Todas as opções pertencem ao município de {MUNICIPIO_OFICIAL}/SP.
                </ThemedText>
                <View
                  style={[
                    styles.cepFeedback,
                    {
                      backgroundColor: setorIdentificado ? theme.primarySoft : theme.input,
                    },
                  ]}>
                  <AppIcon
                    name="location"
                    color={setorIdentificado ? theme.primary : theme.textSecondary}
                    size={18}
                  />
                  <ThemedText
                    type="small"
                    style={[
                      styles.cepFeedbackText,
                      {
                        color: setorIdentificado ? theme.primary : theme.textSecondary,
                      },
                    ]}>
                    {setorIdentificado
                      ? `Setor identificado automaticamente: ${setorIdentificado}`
                      : 'Informe um bairro cadastrado ou distrito para identificar o setor automaticamente.'}
                  </ThemedText>
                </View>

                {form.endereco.trim().length >= 3 &&
                obterDigitosCep(form.cep ?? '').length < MAX_DIGITOS_CEP ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={cepSearching}
                    onPress={() => void searchCepByAddress()}
                    style={({ pressed }) => [
                      styles.searchCepButton,
                      {
                        backgroundColor: theme.primarySoft,
                        borderColor: theme.primary,
                        opacity: cepSearching ? 0.55 : pressed ? 0.72 : 1,
                      },
                    ]}>
                    <AppIcon name="search" color={theme.primary} size={20} />
                    <ThemedText type="smallBold" style={{ color: theme.primary }}>
                      {cepSearching ? 'Buscando CEP…' : 'Buscar CEP pelo endereço'}
                    </ThemedText>
                  </Pressable>
                ) : null}
              </FormSection>

              <FormSection title="Função" icon="work">
                <View style={styles.choiceGroup}>
                  <ThemedText type="smallBold">Cargos</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Selecione todos os cargos que a pessoa exerce.
                  </ThemedText>
                  <MultipleChoiceChips<Cargo>
                    values={CARGOS}
                    selected={(form.cargos as Cargo[] | undefined) ?? []}
                    onChange={(value) => setField('cargos', value)}
                  />
                  {errors.cargos ? (
                    <ThemedText type="small" style={{ color: theme.danger }}>
                      {errors.cargos}
                    </ThemedText>
                  ) : null}
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <SelectField<Ministerio>
                  label="Ministério"
                  value={(form.ministerio as Ministerio | null) ?? null}
                  options={MINISTERIOS}
                  error={errors.ministerio}
                  onChange={(value) => setField('ministerio', value)}
                />
              </FormSection>

              <FormSection title="Situação" icon="people">
                <View style={styles.choiceGroup}>
                  <ThemedText type="smallBold">Situação religiosa</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Escolha apenas uma opção ou deixe sem informação.
                  </ThemedText>
                  <ChoiceChips<SituacaoReligiosa>
                    values={SITUACOES_RELIGIOSAS}
                    selected={(form.situacaoReligiosa as SituacaoReligiosa | null) ?? null}
                    onChange={(value) => setField('situacaoReligiosa', value)}
                  />
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.choiceGroup}>
                  <ThemedText type="smallBold">Situação econômica</ThemedText>
                  <ChoiceChips<SituacaoEconomica>
                    values={SITUACOES_ECONOMICAS}
                    selected={(form.situacaoEconomica as SituacaoEconomica | null) ?? null}
                    onChange={(value) => setField('situacaoEconomica', value)}
                  />
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.choiceGroup}>
                  <ThemedText type="smallBold">Tipo de residência</ThemedText>
                  <ChoiceChips<TipoResidencia>
                    values={TIPOS_RESIDENCIA}
                    selected={(form.residencia as TipoResidencia | null) ?? null}
                    onChange={(value) => setField('residencia', value)}
                  />
                </View>
              </FormSection>

              {submitError ? (
                <View style={[styles.errorBanner, { backgroundColor: theme.dangerSoft }]}>
                  <AppIcon name="warning" color={theme.danger} size={20} />
                  <ThemedText type="smallBold" style={[styles.errorText, { color: theme.danger }]}>
                    {submitError}
                  </ThemedText>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={onCancel}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: theme.border,
                      borderWidth: 1,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}>
                  <ThemedText type="smallBold">Cancelar</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={submit}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: theme.primary,
                      opacity: pressed || saving ? 0.72 : 1,
                    },
                  ]}>
                  <View style={styles.actionButtonContent}>
                    <AppIcon name="save" color="#FFFFFF" size={20} />
                    <ThemedText type="smallBold" style={styles.saveText}>
                      {saving ? 'Salvando…' : submitLabel}
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <CepResultsModal
            visible={cepResultsOpen}
            results={cepResults}
            usingCache={usingCachedResults}
            onClose={() => setCepResultsOpen(false)}
            onSelect={selectCepResult}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: AppIconName;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.section, { borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name={icon} color={theme.primary} size={20} />
        </View>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {title}
        </ThemedText>
      </View>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: Spacing.three,
    paddingBottom: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderRadius: 20,
    padding: Spacing.three,
  },
  infoIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  infoCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 28,
  },
  suggestions: {
    gap: Spacing.two,
  },
  cepSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
  },
  cepSuggestionCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  useCepButton: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  cepFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 16,
    padding: Spacing.three,
  },
  cepFeedbackText: {
    flex: 1,
  },
  searchCepButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  suggestion: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  choiceGroup: {
    gap: Spacing.two,
  },
  divider: {
    height: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 18,
    padding: Spacing.three,
  },
  errorText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
  },
  saveText: {
    color: '#FFFFFF',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
